/*
 * DMS.js
 * Transcription of DMS.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * Copyright (c) Charles Karney (2011-2020) <karney@alum.mit.edu> and licensed
 * under the MIT/X11 License.  For more information, see
 * https://geographiclib.sourceforge.io/
 */

var DMS = {};

(function(
  /**
   * @exports DMS
   * @description Decode/Encode angles expressed as degrees, minutes, and
   *   seconds.  This module defines several constants:
   *   - hemisphere indicator (returned by
   *       {@link module:DMS.Decode Decode}) and a formatting
   *       indicator (used by
   *       {@link module:DMS.Encode Encode})
   *     - NONE = 0, no designator and format as plain angle;
   *     - LATITUDE = 1, a N/S designator and format as latitude;
   *     - LONGITUDE = 2, an E/W designator and format as longitude;
   *     - AZIMUTH = 3, format as azimuth;
   *   - the specification of the trailing component in
   *       {@link module:DMS.Encode Encode}
   *     - DEGREE = 0;
   *     - MINUTE = 1;
   *     - SECOND = 2.
   * @example
   * var DMS = require("geographiclib-dms"),
   *     ang = DMS.Decode("127:54:3.123123W");
   * console.log("Azimuth " +
   *     DMS.Encode(ang.val, DMS.MINUTE, 7, ang.ind) +
   *     " = " + ang.val.toFixed(9));
   */
  d) {
  "use strict";

  var lookup, zerofill, internalDecode, numMatch,
      hemispheres_ = "SNWE",
      signs_ = "-+",
      digits_ = "0123456789",
      dmsindicators_ = "D'\":",
      // dmsindicatorsu_ = "\u00b0\u2032\u2033"; // Unicode variants
      dmsindicatorsu_ = "\u00b0'\"", // Use degree symbol
      // Minified js messes up degree symbol, but manually fix this
      // dmsindicatorsu_ = "d'\"", // Use d for degrees
      components_ = ["degrees", "minutes", "seconds"];
  lookup = function(s, c) {
    return s.indexOf(c.toUpperCase());
  };
  zerofill = function(s, n) {
    return String("0000").substr(0, Math.max(0, Math.min(4, n-s.length))) +
      s;
  };
  d.NONE = 0;
  d.LATITUDE = 1;
  d.LONGITUDE = 2;
  d.AZIMUTH = 3;
  d.DEGREE = 0;
  d.MINUTE = 1;
  d.SECOND = 2;

  /**
   * @summary Decode a DMS string.
   * @param {string} dms the string.
   * @return {object} r where r.val is the decoded value (degrees) and r.ind
   *   is a hemisphere designator, one of NONE, LATITUDE, LONGITUDE.
   * @throws an error if the string is illegal.
   *
   * @description Convert a DMS string into an angle.
   *   Degrees, minutes, and seconds are indicated by the characters d, '
   *   (single quote), &quot; (double quote), and these components may only be
   *   given in this order.  Any (but not all) components may be omitted and
   *   other symbols (e.g., the &deg; symbol for degrees and the unicode prime
   *   and double prime symbols for minutes and seconds) may be substituted;
   *   two single quotes can be used instead of &quot;.  The last component
   *   indicator may be omitted and is assumed to be the next smallest unit
   *   (thus 33d10 is interpreted as 33d10').  The final component may be a
   *   decimal fraction but the non-final components must be integers.  Instead
   *   of using d, ', and &quot; to indicate degrees, minutes, and seconds, :
   *   (colon) may be used to <i>separate</i> these components (numbers must
   *   appear before and after each colon); thus 50d30'10.3&quot; may be
   *   written as 50:30:10.3, 5.5' may be written 0:5.5, and so on.  The
   *   integer parts of the minutes and seconds components must be less
   *   than 60.  A single leading sign is permitted.  A hemisphere designator
   *   (N, E, W, S) may be added to the beginning or end of the string.  The
   *   result is multiplied by the implied sign of the hemisphere designator
   *   (negative for S and W).  In addition ind is set to DMS.LATITUDE if N
   *   or S is present, to DMS.LONGITUDE if E or W is present, and to
   *   DMS.NONE otherwise.  Leading and trailing whitespace is removed from
   *   the string before processing.  This routine throws an error on a
   *   malformed string.  No check is performed on the range of the result.
   *   Examples of legal and illegal strings are
   *   - <i>LEGAL</i> (all the entries on each line are equivalent)
   *     - -20.51125, 20d30'40.5&quot;S, -20&deg;30'40.5, -20d30.675,
   *       N-20d30'40.5&quot;, -20:30:40.5
   *     - 4d0'9, 4d9&quot;, 4d9'', 4:0:9, 004:00:09, 4.0025, 4.0025d, 4d0.15,
   *       04:.15
   *     - 4:59.99999999999999, 4:60.0, 4:59:59.9999999999999, 4:59:60.0, 5
   *   - <i>ILLEGAL</i> (the exception thrown explains the problem)
   *     - 4d5&quot;4', 4::5, 4:5:, :4:5, 4d4.5'4&quot;, -N20.5, 1.8e2d, 4:60,
   *       4:59:60
   *
   *   The decoding operation can also perform addition and subtraction
   *   operations.  If the string includes <i>internal</i> signs (i.e., not at
   *   the beginning nor immediately after an initial hemisphere designator),
   *   then the string is split immediately before such signs and each piece is
   *   decoded according to the above rules and the results added; thus
   *   <code>S3-2.5+4.1N</code> is parsed as the sum of <code>S3</code>,
   *   <code>-2.5</code>, <code>+4.1N</code>.  Any piece can include a
   *   hemisphere designator; however, if multiple designators are given, they
   *   must compatible; e.g., you cannot mix N and E.  In addition, the
   *   designator can appear at the beginning or end of the first piece, but
   *   must be at the end of all subsequent pieces (a hemisphere designator is
   *   not allowed after the initial sign).  Examples of legal and illegal
   *   combinations are
   *   - <i>LEGAL</i> (these are all equivalent)
   *     - -070:00:45, 70:01:15W+0:0.5, 70:01:15W-0:0:30W, W70:01:15+0:0:30E
   *   - <i>ILLEGAL</i> (the exception thrown explains the problem)
   *     - 70:01:15W+0:0:15N, W70:01:15+W0:0:15
   *
   *   <b>WARNING</b> The "exponential" notation is not recognized.  Thus
   *   <code>7.0E1</code> is illegal, while <code>7.0E+1</code> is parsed as
   *   <code>(7.0E) + (+1)</code>, yielding the same result as
   *   <code>8.0E</code>.
   */
  d.Decode = function(dms) {
    var dmsa = dms, end,
        // v = -0.0, so "-0" returns -0.0
        v = -0, i = 0, mi, pi, vals,
        ind1 = d.NONE, ind2, p, pa, pb;
    dmsa = dmsa
      .replace(/\u00b0/g, 'd' ) // U+00b0 degree symbol
      .replace(/\u00ba/g, 'd' ) // U+00ba alt symbol
      .replace(/\u2070/g, 'd' ) // U+2070 sup zero
      .replace(/\u02da/g, 'd' ) // U+02da ring above
      .replace(/\u2218/g, 'd' ) // U+2218 compose function
      .replace(/\*/g    , 'd' ) // GRiD symbol for degree

      .replace(/`/g     , 'd' ) // grave accent
      .replace(/\u2032/g, '\'') // U+2032 prime
      .replace(/\u2035/g, '\'') // U+2035 back prime
      .replace(/\u00b4/g, '\'') // U+00b4 acute accent
      .replace(/\u2018/g, '\'') // U+2018 left single quote
      .replace(/\u2019/g, '\'') // U+2019 right single quote
      .replace(/\u201b/g, '\'') // U+201b reversed-9 single quote
      .replace(/\u02b9/g, '\'') // U+02b9 modifier letter prime
      .replace(/\u02ca/g, '\'') // U+02ca modifier letter acute accent
      .replace(/\u02cb/g, '\'') // U+02cb modifier letter grave accent

      .replace(/\u2033/g, '"' ) // U+2033 double prime
      .replace(/\u2036/g, '"' ) // U+2036 reversed double prime
      .replace(/\u02dd/g, '"' ) // U+02dd double acute accent
      .replace(/\u201c/g, '"' ) // U+201d left double quote
      .replace(/\u201d/g, '"' ) // U+201d right double quote
      .replace(/\u201f/g, '"' ) // U+201f reversed-9 double quote
      .replace(/\u02ba/g, '"' ) // U+02ba modifier letter double prime

      .replace(/\u2795/g, '+' ) // U+2795 heavy plus
      .replace(/\u2064/g, '+' ) // U+2064 invisible plus

      .replace(/\u2010/g, '-' ) // U+2010 dash
      .replace(/\u2011/g, '-' ) // U+2011 non-breaking hyphen
      .replace(/\u2013/g, '-' ) // U+2013 en dash
      .replace(/\u2014/g, '-' ) // U+2014 em dash
      .replace(/\u2212/g, '-' ) // U+2212 minus sign
      .replace(/\u2796/g, '-' ) // U+2796 heavy minus

      .replace(/\u00a0/g, ''  ) // U+00a0 non-breaking space
      .replace(/\u2007/g, ''  ) // U+2007 figure space
      .replace(/\u2009/g, ''  ) // U+2009 thin space
      .replace(/\u200a/g, ''  ) // U+200a hair space
      .replace(/\u200b/g, ''  ) // U+200b invisible space
      .replace(/\u202f/g, ''  ) // U+202f narrow space
      .replace(/\u2063/g, ''  ) // U+2063 invisible separator

      .replace(/''/g,     '"' ) // '' -> "

      .trim();

    end = dmsa.length;
    // p is pointer to the next piece that needs decoding
    for (p = 0; p < end; p = pb, ++i) {
      pa = p;
      // Skip over initial hemisphere letter (for i == 0)
      if (i === 0 && lookup(hemispheres_, dmsa.charAt(pa)) >= 0)
        ++pa;
      // Skip over initial sign (checking for it if i == 0)
      if (i > 0 || (pa < end && lookup(signs_, dmsa.charAt(pa)) >= 0))
        ++pa;
      // Find next sign
      mi = dmsa.substr(pa, end - pa).indexOf('-');
      pi = dmsa.substr(pa, end - pa).indexOf('+');
      if (mi < 0) mi = end; else mi += pa;
      if (pi < 0) pi = end; else pi += pa;
      pb = Math.min(mi, pi);
      vals = internalDecode(dmsa.substr(p, pb - p));
      v += vals.val; ind2 = vals.ind;
      if (ind1 === d.NONE)
        ind1 = ind2;
      else if (!(ind2 === d.NONE || ind1 === ind2))
        throw new Error("Incompatible hemisphere specifies in " +
                        dmsa.substr(0, pb));
    }
    if (i === 0)
      throw new Error("Empty or incomplete DMS string " + dmsa);
    return {val: v, ind: ind1};
  };

  internalDecode = function(dmsa) {
    var vals = {}, errormsg = "",
        sign, beg, end, ind1, k,
        ipieces, fpieces, npiece,
        icurrent, fcurrent, ncurrent, p,
        pointseen,
        digcount, intcount,
        x;
    do {                       // Executed once (provides the ability to break)
      sign = 1;
      beg = 0; end = dmsa.length;
      ind1 = d.NONE;
      k = -1;
      if (end > beg && (k = lookup(hemispheres_, dmsa.charAt(beg))) >= 0) {
        ind1 = (k & 2) ? d.LONGITUDE : d.LATITUDE;
        sign = (k & 1) ? 1 : -1;
        ++beg;
      }
      if (end > beg &&
          (k = lookup(hemispheres_, dmsa.charAt(end-1))) >= 0) {
        if (k >= 0) {
          if (ind1 !== d.NONE) {
            if (dmsa.charAt(beg - 1).toUpperCase() ===
                dmsa.charAt(end - 1).toUpperCase())
              errormsg = "Repeated hemisphere indicators " +
              dmsa.charAt(beg - 1) + " in " +
              dmsa.substr(beg - 1, end - beg + 1);
            else
              errormsg = "Contradictory hemisphere indicators " +
              dmsa.charAt(beg - 1) + " and " + dmsa.charAt(end - 1) + " in " +
              dmsa.substr(beg - 1, end - beg + 1);
            break;
          }
          ind1 = (k & 2) ? d.LONGITUDE : d.LATITUDE;
          sign = (k & 1) ? 1 : -1;
          --end;
        }
      }
      if (end > beg && (k = lookup(signs_, dmsa.charAt(beg))) >= 0) {
        if (k >= 0) {
          sign *= k ? 1 : -1;
          ++beg;
        }
      }
      if (end === beg) {
        errormsg = "Empty or incomplete DMS string " + dmsa;
        break;
      }
      ipieces = [0, 0, 0];
      fpieces = [0, 0, 0];
      npiece = 0;
      icurrent = 0;
      fcurrent = 0;
      ncurrent = 0;
      p = beg;
      pointseen = false;
      digcount = 0;
      intcount = 0;
      while (p < end) {
        x = dmsa.charAt(p++);
        if ((k = lookup(digits_, x)) >= 0) {
          ++ncurrent;
          if (digcount > 0) {
            ++digcount;         // Count of decimal digits
          } else {
            icurrent = 10 * icurrent + k;
            ++intcount;
          }
        } else if (x === '.') {
          if (pointseen) {
            errormsg = "Multiple decimal points in " +
              dmsa.substr(beg, end - beg);
            break;
          }
          pointseen = true;
          digcount = 1;
        } else if ((k = lookup(dmsindicators_, x)) >= 0) {
          if (k >= 3) {
            if (p === end) {
              errormsg = "Illegal for colon to appear at the end of " +
                dmsa.substr(beg, end - beg);
              break;
            }
            k = npiece;
          }
          if (k === npiece - 1) {
            errormsg = "Repeated " + components_[k] +
              " component in " + dmsa.substr(beg, end - beg);
            break;
          } else if (k < npiece) {
            errormsg = components_[k] + " component follows " +
              components_[npiece - 1] + " component in " +
              dmsa.substr(beg, end - beg);
            break;
          }
          if (ncurrent === 0) {
            errormsg = "Missing numbers in " + components_[k] +
              " component of " + dmsa.substr(beg, end - beg);
            break;
          }
          if (digcount > 0) {
            fcurrent = parseFloat(dmsa.substr(p - intcount - digcount - 1,
                                              intcount + digcount));
            icurrent = 0;
          }
          ipieces[k] = icurrent;
          fpieces[k] = icurrent + fcurrent;
          if (p < end) {
            npiece = k + 1;
            icurrent = fcurrent = 0;
            ncurrent = digcount = intcount = 0;
          }
        } else if (lookup(signs_, x) >= 0) {
          errormsg = "Internal sign in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        } else {
          errormsg = "Illegal character " + x + " in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        }
      }
      if (errormsg.length)
        break;
      if (lookup(dmsindicators_, dmsa.charAt(p - 1)) < 0) {
        if (npiece >= 3) {
          errormsg = "Extra text following seconds in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        }
        if (ncurrent === 0) {
          errormsg = "Missing numbers in trailing component of " +
            dmsa.substr(beg, end - beg);
          break;
        }
        if (digcount > 0) {
          fcurrent = parseFloat(dmsa.substr(p - intcount - digcount,
                                            intcount + digcount));
          icurrent = 0;
        }
        ipieces[npiece] = icurrent;
        fpieces[npiece] = icurrent + fcurrent;
      }
      if (pointseen && digcount === 0) {
        errormsg = "Decimal point in non-terminal component of " +
          dmsa.substr(beg, end - beg);
        break;
      }
      // Note that we accept 59.999999... even though it rounds to 60.
      if (ipieces[1] >= 60 || fpieces[1] > 60) {
        errormsg = "Minutes " + fpieces[1] + " not in range [0,60)";
        break;
      }
      if (ipieces[2] >= 60 || fpieces[2] > 60) {
        errormsg = "Seconds " + fpieces[2] + " not in range [0,60)";
        break;
      }
      vals.ind = ind1;
      // Assume check on range of result is made by calling routine (which
      // might be able to offer a better diagnostic).
      vals.val = sign *
        ( fpieces[2] ? (60*(60*fpieces[0] + fpieces[1]) + fpieces[2]) / 3600 :
          ( fpieces[1] ? (60*fpieces[0] + fpieces[1]) / 60 : fpieces[0] ) );
      return vals;
    } while (false);
    vals.val = numMatch(dmsa);
    if (vals.val === 0)
      throw new Error(errormsg);
    else
      vals.ind = d.NONE;
    return vals;
  };

  numMatch = function(s) {
    var t, sign, p0, p1;
    if (s.length < 3)
      return 0;
    t = s.toUpperCase().replace(/0+$/, "");
    sign = t.charAt(0) === '-' ? -1 : 1;
    p0 = t.charAt(0) === '-' || t.charAt(0) === '+' ? 1 : 0;
    p1 = t.length - 1;
    if (p1 + 1 < p0 + 3)
      return 0;
    // Strip off sign and trailing 0s
    t = t.substr(p0, p1 + 1 - p0); // Length at least 3
    if (t === "NAN" || t === "1.#QNAN" || t === "1.#SNAN" || t === "1.#IND" ||
        t === "1.#R")
      return Number.NaN;
    else if (t === "INF" || t === "1.#INF" || t === "INFINITY")
      return sign * Number.POSITIVE_INFINITY;
    return 0;
  };

  /**
   * @summary Decode two DMS strings interpreting them as a latitude/longitude
   *   pair.
   * @param {string} stra the first string.
   * @param {string} strb the first string.
   * @param {bool} [longfirst = false] if true assume then longitude is given
   *   first (in the absence of any hemisphere indicators).
   * @return {object} r where r.lat is the decoded latitude and r.lon is the
   *   decoded longitude (both in degrees).
   * @throws an error if the strings are illegal.
   */
  d.DecodeLatLon = function(stra, strb, longfirst) {
    var vals = {},
        valsa = d.Decode(stra),
        valsb = d.Decode(strb),
        a = valsa.val, ia = valsa.ind,
        b = valsb.val, ib = valsb.ind,
        lat, lon;
    if (!longfirst) longfirst = false;
    if (ia === d.NONE && ib === d.NONE) {
      // Default to lat, long unless longfirst
      ia = longfirst ? d.LONGITUDE : d.LATITUDE;
      ib = longfirst ? d.LATITUDE : d.LONGITUDE;
    } else if (ia === d.NONE)
      ia = d.LATITUDE + d.LONGITUDE - ib;
    else if (ib === d.NONE)
      ib = d.LATITUDE + d.LONGITUDE - ia;
    if (ia === ib)
      throw new Error("Both " + stra + " and " + strb + " interpreted as " +
                      (ia === d.LATITUDE ? "latitudes" : "longitudes"));
    lat = ia === d.LATITUDE ? a : b;
    lon = ia === d.LATITUDE ? b : a;
    if (Math.abs(lat) > 90)
      throw new Error("Latitude " + lat + " not in [-90,90]");
    vals.lat = lat;
    vals.lon = lon;
    return vals;
  };

  /**
   * @summary Decode a DMS string interpreting it as an arc length.
   * @param {string} angstr the string (this must not include a hemisphere
   *   indicator).
   * @return {number} the arc length (degrees).
   * @throws an error if the string is illegal.
   */
  d.DecodeAngle = function(angstr) {
    var vals = d.Decode(angstr),
        ang = vals.val, ind = vals.ind;
    if (ind !== d.NONE)
      throw new Error("Arc angle " + angstr +
                      " includes a hemisphere N/E/W/S");
    return ang;
  };

  /**
   * @summary Decode a DMS string interpreting it as an azimuth.
   * @param {string} azistr the string (this may include an E/W hemisphere
   *   indicator).
   * @return {number} the azimuth (degrees).
   * @throws an error if the string is illegal.
   */
  d.DecodeAzimuth = function(azistr) {
    var vals = d.Decode(azistr),
        azi = vals.val, ind = vals.ind;
    if (ind === d.LATITUDE)
      throw new Error("Azimuth " + azistr + " has a latitude hemisphere N/S");
    return azi;
  };

  /**
   * @summary Convert angle (in degrees) into a DMS string (using &deg;, ',
   *  and &quot;).
   * @param {number} angle input angle (degrees).
   * @param {number} trailing one of DEGREE, MINUTE, or SECOND to indicate
   *   the trailing component of the string (this component is given as a
   *   decimal number if necessary).
   * @param {number} prec the number of digits after the decimal point for
   *   the trailing component.
   * @param {number} [ind = NONE] a formatting indicator, one of NONE,
   *   LATITUDE, LONGITUDE, AZIMUTH.
   * @param {char} [dmssep = NULL] if non-null, use as the DMS separator
   *   character.
   * @return {string} the resulting string formatted as follows:
   *   * NONE, signed result no leading zeros on degrees except in the units
   *     place, e.g., -8&deg;03'.
   *   * LATITUDE, trailing N or S hemisphere designator, no sign, pad
   *     degrees to 2 digits, e.g., 08&deg;03'S.
   *   * LONGITUDE, trailing E or W hemisphere designator, no sign, pad
   *     degrees to 3 digits, e.g., 008&deg;03'W.
   *   * AZIMUTH, convert to the range [0, 360&deg;), no sign, pad degrees to
   *     3 digits, e.g., 351&deg;57'.
   *
   * <b>WARNING</b> Because of implementation of JavaScript's toFixed function,
   * this routine rounds ties away from zero.  This is different from the C++
   * version of GeographicLib which implements the "round ties to even" rule.
   *
   * <b>WARNING</b> Angles whose magnitude is equal to or greater than
   * 10<sup>21</sup> are printed as a plain number in exponential notation,
   * e.g., "1e21".
   */
  d.Encode = function(angle, trailing, prec, ind, dmssep) {
    // Assume check on range of input angle has been made by calling
    // routine (which might be able to offer a better diagnostic).
    var scale = 1, i, sign,
        idegree, fdegree, degree, minute, second, s, usesep, p;
    if (!ind) ind = d.NONE;
    if (!dmssep) dmssep = '\0';
    usesep = dmssep !== '\0';
    if (!isFinite(angle))
      return angle < 0 ? String("-inf") :
      (angle > 0 ? String("inf") : String("nan"));
    if (Math.abs(angle) >= 1e21)
      // toFixed only works for numbers less that 1e21.
      return angle.toString().replace(/e\+/, 'e'); // remove "+" from exponent

    // 15 - 2 * trailing = ceiling(log10(2^53/90/60^trailing)).
    // This suffices to give full real precision for numbers in [-90,90]
    prec = Math.min(15 - 2 * trailing, prec);
    for (i = 0; i < trailing; ++i)
      scale *= 60;
    if (ind === d.AZIMUTH) {
      angle %= 360;
      // Only angles strictly less than 0 can become 360; since +/-180 are
      // folded together, we convert -0 to +0 (instead of 360).
      if (angle < 0)
        angle += 360;
      else
        angle = 0 + angle;
    }
    sign = (angle < 0 || angle === 0 && 1/angle < 0) ? -1 : 1;
    angle *= sign;

    // Break off integer part to preserve precision and avoid overflow in
    // manipulation of fractional part for MINUTE and SECOND
    idegree = trailing === d.DEGREE ? 0 : Math.floor(angle);
    fdegree = (angle - idegree) * scale;
    s = fdegree.toFixed(prec);
    switch (trailing) {
    case d.DEGREE:
      degree = s;
      break;
    default:                    // case MINUTE: case SECOND:
      p = s.indexOf('.');
      if (p < 0) {
        i = parseInt(s);
        s = "";
      } else if (p === 0) {
        i = 0;
      } else {
        i = parseInt(s.substr(0, p));
        s = s.substr(p);
      }
      // Now i in [0,60] or [0,3600] for MINUTE/DEGREE
      switch (trailing) {
      case d.MINUTE:
        minute = (i % 60).toString() + s; i = Math.trunc(i / 60);
        degree = (i + idegree).toFixed(0); // no overflow since i in [0,1]
        break;
      default:                  // case SECOND:
        second = (i % 60).toString() + s; i = Math.trunc(i / 60);
        minute = (i % 60).toString()    ; i = Math.trunc(i / 60);
        degree = (i + idegree).toFixed(0); // no overflow since i in [0,1]
        break;
      }
      break;
    }
    // No glue together degree+minute+second with
    // sign + zero-fill + delimiters + hemisphere
    s = "";
    if (ind === d.NONE && sign < 0)
      s += '-';
    if (prec) ++prec;           // Extra width for decimal point
    switch (trailing) {
    case d.DEGREE:
      s += zerofill(degree, ind === d.NONE ? 0 : 1 + Math.min(ind, 2) + prec) +
        (usesep ? '' : dmsindicatorsu_.charAt(0));
      break;
    case d.MINUTE:
      s += zerofill(degree, ind === d.NONE ? 0 : 1 + Math.min(ind, 2)) +
        (usesep ? dmssep : dmsindicatorsu_.charAt(0)) +
        zerofill(minute, 2 + prec) +
        (usesep ? '' : dmsindicatorsu_.charAt(1));
      break;
    default:                    // case SECOND:
      s += zerofill(degree, ind === d.NONE ? 0 : 1 + Math.min(ind, 2)) +
        (usesep ? dmssep : dmsindicatorsu_.charAt(0)) +
        zerofill(minute, 2) +
        (usesep ? dmssep : dmsindicatorsu_.charAt(1)) +
        zerofill(second, 2 + prec) +
        (usesep ? '' : dmsindicatorsu_.charAt(2));
      break;
    }
    if (ind !== d.NONE && ind !== d.AZIMUTH)
      s += hemispheres_.charAt((ind === d.LATITUDE ? 0 : 2) +
                               (sign < 0 ? 0 : 1));
    return s;
  };
})(DMS);
