// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import './interfaces/IBranding.sol';
import './interfaces/IAcquisitionRoyale.sol';

library Base64 {
  bytes internal constant TABLE =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  /// @notice Encodes some bytes to the base64 representation
  function encode(bytes memory data) internal pure returns (string memory) {
    uint256 len = data.length;
    if (len == 0) return '';

    // multiply by 4/3 rounded up
    uint256 encodedLen = 4 * ((len + 2) / 3);

    // Add some extra buffer at the end
    bytes memory result = new bytes(encodedLen + 32);

    bytes memory table = TABLE;

    assembly {
      let tablePtr := add(table, 1)
      let resultPtr := add(result, 32)

      for {
        let i := 0
      } lt(i, len) {

      } {
        i := add(i, 3)
        let input := and(mload(add(data, i)), 0xffffff)

        let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
        out := shl(8, out)
        out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
        out := shl(8, out)
        out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
        out := shl(8, out)
        out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
        out := shl(224, out)

        mstore(resultPtr, out)

        resultPtr := add(resultPtr, 4)
      }

      switch mod(len, 3)
        case 1 {
          mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
        }
        case 2 {
          mstore(sub(resultPtr, 1), shl(248, 0x3d))
        }

      mstore(result, encodedLen)
    }

    return string(result);
  }
}

contract TextBranding is IBranding {
  string private _artist;
  IAcquisitionRoyale private _acquisitionRoyale;
  uint256 private constant DISPLAY_LIMIT = 2;
  uint256 private constant DISPLAY_SCALE = 1e18;
  uint256 private constant DISPLAY_DIGITS = 18;

  constructor(address _newAcquisitionRoyale) {
    _artist = 'Acquisition Royale';
    _acquisitionRoyale = IAcquisitionRoyale(_newAcquisitionRoyale);
  }

  function getArt(uint256 _tokenId) external view override returns (string memory) {
    IAcquisitionRoyale.Enterprise memory _enterprise = _acquisitionRoyale.getEnterprise(_tokenId);
    string memory _output =
      string(
        abi.encodePacked(
          getBackgroundAndTable(_tokenId, _enterprise),
          getRpToCompetesRpRows(_tokenId, _enterprise),
          getCompetesDmgToDmgTakenRows(_tokenId, _enterprise),
          getRebrandToReviveRows(_tokenId, _enterprise)
        )
      );
    string memory _json =
      Base64.encode(
        bytes(
          string(
            abi.encodePacked(
              '{"name": "',
              _enterprise.name,
              '", "description": "Acquisition Royale Default Branding", "image": "data:image/svg+xml;base64,',
              Base64.encode(bytes(_output)),
              '"}'
            )
          )
        )
      );
    _output = string(abi.encodePacked('data:application/json;base64,', _json));
    return _output;
  }

  function getArtist() external view override returns (string memory) {
    return _artist;
  }

  function getAcquisitionRoyale() external view returns (address) {
    return address(_acquisitionRoyale);
  }

  function _getDailyRp(uint256 _mergers, uint256 _acquisitions) internal view returns (uint256) {
    (uint256 _maxRp, uint256 _baseRp, uint256 _acquisitionRp, uint256 _mergerRp) =
      _acquisitionRoyale.getPassiveRpPerDay();
    uint256 _rpPerDay = _baseRp + (_mergerRp * _mergers) + (_acquisitionRp * _acquisitions);
    return (_rpPerDay > _maxRp) ? _maxRp : _rpPerDay;
  }

  function getBackgroundAndTable(uint256 _tokenId, IAcquisitionRoyale.Enterprise memory _enterprise)
    internal
    pure
    returns (string memory)
  {
    string[5] memory parts;

    parts[
      0
    ] = '<svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg"><style>@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500&amp;display=swap");</style><g clip-path="url(#prefix__a)"><path fill="url(#prefix__b)" d="M0 0h350v350H0z"/><g filter="url(#prefix__c)"><rect x=".5" y=".5" width="349" height="349" rx="23.5" stroke="#F3D29D"/></g><g filter="url(#prefix__d)"><path stroke="#F3D29D" d="M3.5 3.5h343v343H3.5z"/></g></g><defs><filter id="prefix__c" x="-8" y="-8" width="366" height="366" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="4"/><feColorMatrix values="0 0 0 0 0.901961 0 0 0 0 0.768627 0 0 0 0 0.584314 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_803:3593"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_803:3593" result="shape"/></filter><filter id="prefix__d" x="-5" y="-5" width="360" height="360" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="4"/><feColorMatrix values="0 0 0 0 0.901961 0 0 0 0 0.768627 0 0 0 0 0.584314 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_803:3593"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_803:3593" result="shape"/></filter><linearGradient id="prefix__b" x1="175" y1="0" x2="175" y2="350" gradientUnits="userSpaceOnUse"><stop stop-color="#191623"/><stop offset="1" stop-color="#35376F"/></linearGradient><clipPath id="prefix__a"><path fill="#fff" d="M0 0h350v350H0z"/></clipPath></defs><path d="M81.1162 46L79.908 43.2514H72.5684L71.3602 46H62.9937L74.6223 23.8906H77.8541L89.4827 46H81.1162ZM76.2231 34.7641L74.3806 38.7812H78.0655L76.2231 34.7641ZM104.455 37.1502L110.677 39.778C109.731 41.852 108.311 43.4729 106.419 44.6408C104.546 45.7886 102.341 46.3624 99.804 46.3624C96.4413 46.3624 93.592 45.2852 91.2562 43.1306C88.9204 40.9761 87.7526 38.2577 87.7526 34.9755C87.7526 31.6933 88.9204 28.975 91.2562 26.8204C93.592 24.6457 96.4413 23.5584 99.804 23.5584C102.14 23.5584 104.304 24.1624 106.298 25.3706C108.291 26.5586 109.781 28.1494 110.768 30.1429L104.425 32.8008C104.163 31.9551 103.61 31.2101 102.764 30.5657C101.938 29.9012 101.002 29.569 99.955 29.569C98.5455 29.569 97.4078 30.0724 96.5419 31.0792C95.6761 32.086 95.2432 33.3848 95.2432 34.9755C95.2432 36.5461 95.6761 37.8449 96.5419 38.8718C97.4279 39.8786 98.5656 40.382 99.955 40.382C101.002 40.382 101.938 40.0599 102.764 39.4155C103.61 38.7712 104.174 38.0161 104.455 37.1502ZM132.317 39.9894L135.398 39.9592V46.0302H123.437C119.41 46.0302 116.369 44.9831 114.315 42.889C112.281 40.7747 111.265 38.0664 111.265 34.7641C111.265 31.6833 112.432 29.0454 114.768 26.8506C117.104 24.6558 119.893 23.5584 123.135 23.5584C126.477 23.5584 129.286 24.5148 131.562 26.4278C133.837 28.3407 134.975 30.8174 134.975 33.858C134.975 35.2675 134.713 36.4958 134.189 37.5429C133.666 38.5899 133.042 39.4054 132.317 39.9894ZM118.816 34.7641C118.816 36.1535 119.208 37.3818 119.994 38.449C120.799 39.5162 121.846 40.0498 123.135 40.0498C124.423 40.0498 125.46 39.5162 126.246 38.449C127.031 37.3818 127.424 36.1535 127.424 34.7641C127.424 33.415 127.021 32.2068 126.216 31.1396C125.43 30.0724 124.403 29.5388 123.135 29.5388C121.826 29.5388 120.779 30.0724 119.994 31.1396C119.208 32.2068 118.816 33.415 118.816 34.7641ZM148.397 46.3322C145.296 46.3322 142.81 45.4765 140.937 43.7649C139.064 42.0332 138.128 39.7176 138.128 36.818V23.8906H145.679V37.0898C145.679 38.1167 145.961 38.8517 146.525 39.2947C147.109 39.7377 147.733 39.9592 148.397 39.9592C149.082 39.9592 149.696 39.7377 150.24 39.2947C150.804 38.8517 151.086 38.1167 151.086 37.0898V23.8906H158.667V36.818C158.667 39.7176 157.73 42.0332 155.858 43.7649C154.005 45.4765 151.518 46.3322 148.397 46.3322ZM170.518 23.8906V46H162.967V23.8906H170.518ZM173.018 42.2245L176.28 37.7241C177.266 38.449 178.424 39.0732 179.753 39.5967C181.102 40.1203 182.351 40.382 183.498 40.382C184.888 40.382 185.582 40.0196 185.582 39.2947C185.582 38.6302 184.787 38.1469 183.196 37.8449C183.055 37.8248 182.834 37.7845 182.532 37.7241C181.847 37.6033 181.303 37.5026 180.901 37.422C180.518 37.3415 179.964 37.2005 179.24 36.9992C178.535 36.7978 177.971 36.5965 177.548 36.3951C177.125 36.1937 176.642 35.9219 176.098 35.5796C175.555 35.2171 175.132 34.8346 174.83 34.4318C174.528 34.009 174.266 33.4955 174.044 32.8914C173.843 32.2873 173.742 31.6229 173.742 30.898C173.742 29.8106 173.934 28.834 174.316 27.9682C174.719 27.0822 175.232 26.3774 175.857 25.8539C176.481 25.3102 177.206 24.8672 178.031 24.5249C178.877 24.1826 179.703 23.9409 180.508 23.8C181.334 23.659 182.179 23.5886 183.045 23.5886C186.831 23.5886 190.002 24.8169 192.56 27.2735L189.388 31.8343C187.072 30.2838 184.908 29.5086 182.894 29.5086C181.827 29.5086 181.293 29.871 181.293 30.5959C181.293 31.2604 182.23 31.7235 184.102 31.9853C184.908 32.1061 185.502 32.2068 185.884 32.2873C186.287 32.3478 186.861 32.4686 187.606 32.6498C188.371 32.831 188.955 33.0223 189.358 33.2237C189.781 33.4049 190.264 33.6767 190.808 34.0392C191.372 34.3815 191.794 34.7741 192.076 35.2171C192.378 35.64 192.63 36.1736 192.831 36.818C193.053 37.4422 193.164 38.1369 193.164 38.902C193.164 41.3385 192.318 43.191 190.626 44.4596C188.955 45.7282 186.7 46.3624 183.861 46.3624C181.666 46.3624 179.703 46.0101 177.971 45.3053C176.259 44.6005 174.608 43.5736 173.018 42.2245ZM203.407 23.8906V46H195.856V23.8906H203.407ZM223.875 23.8906V29.8408H218.287V46H210.766V29.8408H205.148V23.8906H223.875ZM233.463 23.8906V46H225.912V23.8906H233.463ZM257.286 43.1004C255.092 45.2751 252.172 46.3624 248.527 46.3624C244.883 46.3624 241.963 45.2751 239.768 43.1004C237.573 40.9056 236.476 38.1872 236.476 34.9453C236.476 31.7235 237.573 29.0152 239.768 26.8204C241.963 24.6256 244.883 23.5282 248.527 23.5282C252.152 23.5282 255.061 24.6256 257.256 26.8204C259.471 29.0152 260.579 31.7235 260.579 34.9453C260.579 38.1872 259.481 40.9056 257.286 43.1004ZM248.527 29.5388C247.198 29.5388 246.111 30.0824 245.265 31.1698C244.44 32.2571 244.027 33.5156 244.027 34.9453C244.027 36.4152 244.44 37.6838 245.265 38.751C246.111 39.8182 247.198 40.3518 248.527 40.3518C249.896 40.3518 250.984 39.8182 251.789 38.751C252.595 37.6838 252.997 36.4152 252.997 34.9453C252.997 33.4754 252.595 32.2068 251.789 31.1396C250.984 30.0724 249.896 29.5388 248.527 29.5388ZM283.795 46H280.624L270.566 36.7575V46H263.015V23.8906H266.156L276.244 33.1935V23.8906H283.795V46Z" fill="#F3D29D"/><path d="M80.0571 83.1929V94.2041H67.2699V57.0603H85.3344C89.5968 57.0603 93.0642 58.3458 95.7367 60.9168C98.443 63.4539 99.7961 66.7353 99.7961 70.7609C99.7961 73.0951 99.2379 75.2094 98.1216 77.1038C97.0053 78.9982 95.483 80.3682 93.5547 81.2139L103.348 94.2041H89.1401L81.5794 83.1929H80.0571ZM80.0571 67.0567V73.704H83.9136C84.7255 73.704 85.4697 73.4334 86.1463 72.8921C86.8567 72.3508 87.2119 71.5051 87.2119 70.355C87.2119 69.3401 86.9243 68.5451 86.3493 67.97C85.7742 67.3611 84.9623 67.0567 83.9136 67.0567H80.0571ZM138.367 89.3328C134.679 92.9863 129.774 94.813 123.651 94.813C117.528 94.813 112.623 92.9863 108.936 89.3328C105.248 85.6455 103.405 81.0786 103.405 75.6322C103.405 70.2196 105.248 65.6697 108.936 61.9824C112.623 58.2951 117.528 56.4514 123.651 56.4514C129.74 56.4514 134.629 58.2951 138.316 61.9824C142.037 65.6697 143.898 70.2196 143.898 75.6322C143.898 81.0786 142.054 85.6455 138.367 89.3328ZM123.651 66.5492C121.419 66.5492 119.592 67.4626 118.171 69.2894C116.784 71.1161 116.091 73.2304 116.091 75.6322C116.091 78.1017 116.784 80.2329 118.171 82.0258C119.592 83.8187 121.419 84.7152 123.651 84.7152C125.952 84.7152 127.778 83.8187 129.131 82.0258C130.485 80.2329 131.161 78.1017 131.161 75.6322C131.161 73.1627 130.485 71.0315 129.131 69.2386C127.778 67.4457 125.952 66.5492 123.651 66.5492ZM156.505 79.9961L142.145 57.0603H156.606L163 68.9342L169.191 57.0603H183.957L169.292 79.9961V94.2041H156.505V79.9961ZM205.133 94.2041L203.103 89.5865H190.773L188.743 94.2041H174.687L194.223 57.0603H199.653L219.189 94.2041H205.133ZM196.912 75.3278L193.817 82.0766H200.008L196.912 75.3278ZM232.971 84.2078H250.173V94.2041H220.184V57.0603H232.971V84.2078ZM283.387 67.0567H265.678V70.5579H281.357V80.5543H265.678V84.157H283.387V94.2041H252.89V57.0603H283.387V67.0567Z" fill="#F3D29D"/><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-weight="500" font-size="20" letter-spacing="0em" x="50%" y="133"><tspan text-anchor="middle">';
    parts[1] = _enterprise.name;
    parts[
      2
    ] = '</tspan></text><text fill="#F3D29D" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="18" letter-spacing="0em" x="50%" y="156" text-anchor="middle">Enterprise #<tspan>';
    parts[3] = _toString(_tokenId);
    parts[
      4
    ] = '</tspan></text><rect x="41" y="175.474" width="270" height="154.052" fill="#191623"/><line x1="48" y1="186.2583" x2="115" y2="186.2583" stroke="#F3D29D" stroke-width="0.948304"/><line x1="48" y1="193.7929" x2="115" y2="193.7929" stroke="#F3D29D" stroke-width="0.948304"/><text fill="#F3D29D" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-weight="500" font-size="13" letter-spacing="0.04em"><tspan x="50%" y="194.7969" text-anchor="middle">BALANCE SHEET</tspan></text><line x1="235" y1="186.2583" x2="304" y2="186.2583" stroke="#F3D29D" stroke-width="0.948304"/><line x1="235" y1="193.7929" x2="304" y2="193.7929" stroke="#F3D29D" stroke-width="0.948304"/><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="214.7969">Runway Points (RP)<tspan x="304" text-anchor="end">';

    return string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4]));
  }

  function getRpToCompetesRpRows(uint256 _tokenId, IAcquisitionRoyale.Enterprise memory _enterprise)
    internal
    view
    returns (string memory)
  {
    string[9] memory parts;

    parts[0] = _getDisplayValue(_acquisitionRoyale.getEnterpriseVirtualBalance(_tokenId));
    parts[
      1
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="229.7969">RP / Day<tspan x="304" text-anchor="end">+';
    parts[2] = _getDisplayValue(_getDailyRp(_enterprise.mergers, _enterprise.acquisitions));
    parts[
      3
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="244.7969">Mergers<tspan x="304" text-anchor="end">';
    parts[4] = _toString(_enterprise.mergers);
    parts[
      5
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="259.7969">Acquisitions<tspan x="304" text-anchor="end">';
    parts[6] = _toString(_enterprise.acquisitions);
    parts[
      7
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="274.7969">Competes (RP / Dmg)<tspan x="304" text-anchor="end">';
    parts[8] = _getDisplayValue(_enterprise.competes);

    return
      string(
        abi.encodePacked(
          parts[0],
          parts[1],
          parts[2],
          parts[3],
          parts[4],
          parts[5],
          parts[6],
          parts[7],
          parts[8]
        )
      );
  }

  function getCompetesDmgToDmgTakenRows(
    uint256 _tokenId,
    IAcquisitionRoyale.Enterprise memory _enterprise
  ) internal pure returns (string memory) {
    string[9] memory parts;

    parts[0] = ' / ';
    parts[1] = _getDisplayValue(_enterprise.damageDealt);
    parts[
      2
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="289.7969">Fundraising (RP / ETH)<tspan x="304" text-anchor="end">';
    parts[3] = _getDisplayValue(_enterprise.fundraiseRpTotal);
    parts[4] = ' / ';
    parts[5] = _getDisplayValue(_enterprise.fundraiseWethTotal);
    parts[
      6
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="304.7969">Dmg Taken<tspan x="304" text-anchor="end">';
    parts[7] = _getDisplayValue(_enterprise.damageTaken);
    parts[
      8
    ] = '</tspan></text><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Maven Pro" font-size="12" letter-spacing="0em" x="48" y="319.7969">Rebrands / Revives<tspan x="304" text-anchor="end">';

    return
      string(
        abi.encodePacked(
          parts[0],
          parts[1],
          parts[2],
          parts[3],
          parts[4],
          parts[5],
          parts[6],
          parts[7],
          parts[8]
        )
      );
  }

  function getRebrandToReviveRows(
    uint256 _tokenId,
    IAcquisitionRoyale.Enterprise memory _enterprise
  ) internal pure returns (string memory) {
    string[4] memory parts;

    parts[0] = _toString(_enterprise.rebrands);
    parts[1] = ' / ';
    parts[2] = _toString(_enterprise.revives);
    parts[
      3
    ] = '</tspan></text><rect x="41" y="175.474" width="270" height="154.052" stroke="#F3D29D" stroke-width="0.948304"/></svg>';

    return string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3]));
  }

  function _toString(uint256 value) internal pure returns (string memory) {
    // Inspired by OraclizeAPI's implementation - MIT license
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

    if (value == 0) {
      return '0';
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }

  /**
   * @notice cut string s into s[start:end]
   * @param _s the string to cut
   * @param _start the starting index
   * @param _end the ending index (excluded in the substring)
   */
  function _slice(
    string memory _s,
    uint256 _start,
    uint256 _end
  ) internal pure returns (string memory) {
    bytes memory a = new bytes(_end - _start);
    for (uint256 i = 0; i < _end - _start; i++) {
      a[i] = bytes(_s)[_start + i];
    }
    return string(a);
  }

  function _getDisplayValue(uint256 _value) internal pure returns (string memory) {
    uint256 remainder = _value % DISPLAY_SCALE;
    uint256 quotient = _value / DISPLAY_SCALE;
    string memory quotientStr = _toString(quotient);

    if (remainder == 0) return quotientStr;

    uint256 trailingZeroes;
    while (remainder % 10 == 0) {
      remainder = remainder / 10;
      trailingZeroes += 1;
    }

    uint256 startingZeroes = DISPLAY_DIGITS - trailingZeroes;
    // pad the number with "1 + starting zeroes"
    remainder += 10**(startingZeroes);

    uint256 displayPrecision;
    if (startingZeroes > DISPLAY_LIMIT) {
      displayPrecision = DISPLAY_LIMIT;
    } else {
      displayPrecision = startingZeroes;
    }

    string memory tmpStr = _toString(remainder);
    tmpStr = _slice(tmpStr, 1, 1 + displayPrecision);

    string memory completeStr = string(abi.encodePacked(quotientStr, '.', tmpStr));
    return completeStr;
  }
}
