/**
 * DMS.js
 * Transcription of DMS.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * Copyright (c) Charles Karney (2011-2015) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

GeographicLib.DMS = {};

(function(d) {
  "use strict";

  var lookup, zerofill, InternalDecode, NumMatch,
      hemispheres_ = "SNWE",
      signs_ = "-+",
      digits_ = "0123456789",
      dmsindicators_ = "D'\":",
      // dmsindicatorsu_ = "\u00b0\u2032\u2033"; // Unicode variants
      dmsindicatorsu_ = "\u00b0'\"", // Use degree symbol
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
  d.NUMBER = 4;
  d.DEGREE = 0;
  d.MINUTE = 1;
  d.SECOND = 2;

  // return val, ind
  d.Decode = function(dms) {
    var dmsa = dms, end,
        v = 0, i = 0, mi, pi, vals,
        ind1 = d.NONE, ind2, p, pa, pb;
    dmsa = dmsa.replace(/\u00b0/g, 'd')
          .replace(/\u00ba/g, 'd')
          .replace(/\u2070/g, 'd')
          .replace(/\u02da/g, 'd')
          .replace(/\u2032/g, '\'')
          .replace(/\u00b4/g, '\'')
          .replace(/\u2019/g, '\'')
          .replace(/\u2033/g, '"')
          .replace(/\u201d/g, '"')
          .replace(/\u2212/g, '-')
          .replace(/''/g, '"')
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
      vals = InternalDecode(dmsa.substr(p, pb - p));
      v += vals.val; ind2 = vals.ind;
      if (ind1 == d.NONE)
        ind1 = ind2;
      else if (!(ind2 == d.NONE || ind1 == ind2))
        throw new Error("Incompatible hemisphere specifies in " +
                        dmsa.substr(0, pb));
    }
    if (i === 0)
      throw new Error("Empty or incomplete DMS string " + dmsa);
    return {val: v, ind: ind1};
  };

  InternalDecode = function(dmsa) {
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
    vals.val = NumMatch(dmsa);
    if (vals.val === 0)
      throw new Error(errormsg);
    else
      vals.ind = d.NONE;
    return vals;
  };

  NumMatch = function(s) {
    var t, sign, p0, p1;
    if (s.length < 3)
      return 0;
    t = s.toUpperCase().replace(/0+$/,"");
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
    else if (t === "INF" || t === "1.#INF")
      return sign * Number.POSITIVE_INFINITY;
    return 0;
  };

  // return lat, lon
  d.DecodeLatLon = function(stra, strb, swaplatlong) {
    var vals = {},
        valsa = d.Decode(stra),
        valsb = d.Decode(strb),
        a = valsa.val, ia = valsa.ind,
        b = valsb.val, ib = valsb.ind,
        lat, lon;
    if (!swaplatlong) swaplatlong = false;
    if (ia === d.NONE && ib === d.NONE) {
      // Default to lat, long unless swaplatlong
      ia = swaplatlong ? d.LONGITUDE : d.LATITUDE;
      ib = swaplatlong ? d.LATITUDE : d.LONGITUDE;
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

  d.DecodeAngle = function(angstr) {
    var vals = d.Decode(angstr),
        ang = vals.val, ind = vals.ind;
    if (ind !== d.NONE)
      throw new Error("Arc angle " + angstr + " includes a hemisphere N/E/W/S");
    return ang;
  };

  d.DecodeAzimuth = function(azistr) {
    var vals = d.Decode(azistr),
        azi = vals.val, ind = vals.ind;
    if (ind === d.LATITUDE)
      throw new Error("Azimuth " + azistr + " has a latitude hemisphere N/S");
    return azi;
  };

  d.Encode = function(angle, trailing, prec, ind) {
    // Assume check on range of input angle has been made by calling
    // routine (which might be able to offer a better diagnostic).
    var scale = 1, i, sign,
        idegree, fdegree, f, pieces, ip, fp, s;
    if (!ind) ind = d.NONE;
    if (!isFinite(angle))
      return angle < 0 ? String("-inf") :
      (angle > 0 ? String("inf") : String("nan"));

    // 15 - 2 * trailing = ceiling(log10(2^53/90/60^trailing)).
    // This suffices to give full real precision for numbers in [-90,90]
    prec = Math.min(15 - 2 * trailing, prec);
    for (i = 0; i < trailing; ++i)
      scale *= 60;
    for (i = 0; i < prec; ++i)
      scale *= 10;
    if (ind === d.AZIMUTH)
      angle -= Math.floor(angle/360) * 360;
    sign = angle < 0 ? -1 : 1;
    angle *= sign;

    // Break off integer part to preserve precision in manipulation of
    // fractional part.
    idegree = Math.floor(angle);
    fdegree = (angle - idegree) * scale + 0.5;
    f = Math.floor(fdegree);
    // Implement the "round ties to even" rule
    fdegree = (f == fdegree && (f & 1)) ? f - 1 : f;
    fdegree /= scale;

    fdegree = Math.floor((angle - idegree) * scale + 0.5) / scale;
    if (fdegree >= 1) {
      idegree += 1;
      fdegree -= 1;
    }
    pieces = [fdegree, 0, 0];
    for (i = 1; i <= trailing; ++i) {
      ip = Math.floor(pieces[i - 1]);
      fp = pieces[i - 1] - ip;
      pieces[i] = fp * 60;
      pieces[i - 1] = ip;
    }
    pieces[0] += idegree;
    s = "";
    if (ind === d.NONE && sign < 0)
      s += '-';
    switch (trailing) {
    case d.DEGREE:
      s += zerofill(pieces[0].toFixed(prec),
                    ind === d.NONE ? 0 :
                    1 + Math.min(ind, 2) + prec + (prec ? 1 : 0)) +
        dmsindicatorsu_.charAt(0);
      break;
    default:
      s += zerofill(pieces[0].toFixed(0),
                    ind === d.NONE ? 0 : 1 + Math.min(ind, 2)) +
        dmsindicatorsu_.charAt(0);
      switch (trailing) {
      case d.MINUTE:
        s += zerofill(pieces[1].toFixed(prec), 2 + prec + (prec ? 1 : 0)) +
          dmsindicatorsu_.charAt(1);
        break;
      case d.SECOND:
        s += zerofill(pieces[1].toFixed(0), 2) + dmsindicatorsu_.charAt(1);
        s += zerofill(pieces[2].toFixed(prec), 2 + prec + (prec ? 1 : 0)) +
          dmsindicatorsu_.charAt(2);
        break;
      default:
        break;
      }
    }
    if (ind !== d.NONE && ind !== d.AZIMUTH)
      s += hemispheres_.charAt((ind === d.LATITUDE ? 0 : 2) +
                               (sign < 0 ? 0 : 1));
    return s;
  };
})(GeographicLib.DMS);
