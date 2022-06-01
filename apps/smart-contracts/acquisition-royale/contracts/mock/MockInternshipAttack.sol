// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "../AcquisitionRoyaleInternship.sol";

contract MockInternshipAttack {
  AcquisitionRoyaleInternship targetAcqrInternship;

  constructor(address _acquisitionRoyaleInternshipAddress) {
    targetAcqrInternship = AcquisitionRoyaleInternship(_acquisitionRoyaleInternshipAddress);
  }

  function attack() external {
    targetAcqrInternship.doTask();
  }
}
