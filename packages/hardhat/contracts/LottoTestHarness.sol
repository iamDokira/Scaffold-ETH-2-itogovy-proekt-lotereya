// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Lotto.sol";

contract LottoTestHarness is Lotto {
    function seedTicket(
        address player,
        uint8[6] calldata numbers
    ) external {
        require(msg.sender == owner, "Only owner");

        tickets.push(
            Ticket({
                player: player,
                numbers: numbers,
                round: round,
                prize: 0
            })
        );
    }
}