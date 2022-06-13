"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fs = require("fs");

var path = require("path");

var Promise = require("bluebird");

var sharp = require("sharp");

var _require = require("./common.js"),
    defaultIcons = _require.defaultIcons,
    doesIconExist = _require.doesIconExist;

sharp.simd(true);

function generateIcons(icons, srcIcon) {
  return Promise.map(icons, function (icon) {
    var size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf("x")));
    var imgPath = path.join("public", icon.src);
    return sharp(srcIcon).resize(size).toFile(imgPath).then(function () {});
  });
}

exports.onPostBuild = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref, pluginOptions) {
    var graphql, icon, manifest, _yield$graphql, data, siteTitle, iconPath;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            graphql = _ref.graphql;
            icon = pluginOptions.icon, manifest = (0, _objectWithoutPropertiesLoose2.default)(pluginOptions, ["icon"]);
            _context.next = 4;
            return graphql(pluginOptions.query);

          case 4:
            _yield$graphql = _context.sent;
            data = _yield$graphql.data;
            siteTitle = data.allGhostSettings.edges[0].node.title || "No Title";
            manifest = (0, _extends2.default)({}, manifest, {
              name: siteTitle
            }); // Delete options we won't pass to the manifest.webmanifest.

            delete manifest.plugins;
            delete manifest.legacy;
            delete manifest.theme_color_in_head;
            delete manifest.query; // If icons are not manually defined, use the default icon set.

            if (!manifest.icons) {
              manifest.icons = defaultIcons;
            } // Determine destination path for icons.


            iconPath = path.join("public", path.dirname(manifest.icons[0].src)); //create destination directory if it doesn't exist

            if (!fs.existsSync(iconPath)) {
              fs.mkdirSync(iconPath);
            }

            fs.writeFileSync(path.join("public", "manifest.webmanifest"), JSON.stringify(manifest)); // Only auto-generate icons if a src icon is defined.

            if (icon !== undefined) {
              // Check if the icon exists
              if (!doesIconExist(icon)) {
                Promise.reject("icon (" + icon + ") does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.");
              }

              generateIcons(manifest.icons, icon).then(function () {
                //images have been generated
                console.log("done generating icons for manifest");
                Promise.resolve();
              });
            } else {
              Promise.resolve();
            }

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();