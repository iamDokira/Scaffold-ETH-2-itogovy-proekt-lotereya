// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Lotto
 * @notice Лотерея «6 из 49»: билеты с 6 числами, розыгрыш 6 чисел,
 *         выигрыши по совпадениям. Билет стоит 1 ETH, призы — ETH.
 * @dev Учебный проект. Все призы — виртуальные ETH в локальной сети.
 */
contract Lotto {
    // ===== State =====
    address public immutable owner;
    uint256 public round;
    uint256 public constant TICKET_PRICE = 1 ether;
    uint256 public constant MAX_NUMBER = 49;

    struct Ticket {
        address player;
        uint8[6] numbers;
        uint256 round;
        uint256 prize;
    }

    Ticket[] public tickets;
    uint8[6] public lastDrawnNumbers;
    mapping(address => uint256) public lastPrize;
    mapping(address => uint256) public wins;
    mapping(address => uint256) public ticketsBought;

    // ===== Events =====
    event TicketBought(address indexed player, uint8[6] numbers, uint256 round, uint256 price);
    event NumbersDrawn(uint8[6] numbers, uint256 round, uint256 totalTickets);
    event PrizePaid(address indexed player, uint256 amount, uint8 matches, uint256 round);

    // ===== Modifiers =====
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ===== Constructor =====
    constructor() {
        owner = msg.sender;
    }

    // ===== READ =====
    function getTicketsCount() external view returns (uint256) {
        return tickets.length;
    }

    function getTicket(uint256 index) external view returns (Ticket memory) {
        return tickets[index];
    }

    function getMyTickets() external view returns (Ticket[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].player == msg.sender) count++;
        }
        Ticket[] memory result = new Ticket[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].player == msg.sender) {
                result[j] = tickets[i];
                j++;
            }
        }
        return result;
    }

    function getLastDraw() external view returns (uint8[6] memory) {
        return lastDrawnNumbers;
    }

    function getMyPrize() external view returns (uint256) {
        return lastPrize[msg.sender];
    }

    function getWins(address player) external view returns (uint256) {
        return wins[player];
    }

    function getMyTicketsBought() external view returns (uint256) {
        return ticketsBought[msg.sender];
    }

    // ===== WRITE =====
    function buyTicket() external payable {
        require(msg.value == TICKET_PRICE, "Must pay 1 ETH for ticket");

        // Генерация 6 уникальных чисел
        uint8[6] memory numbers;
        uint256 nonce = 0;
        for (uint256 i = 0; i < 6; i++) {
            bool unique = false;
            while (!unique) {
                uint256 rand =
                    (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, nonce, i))) %
                        MAX_NUMBER) + 1;
                unique = true;
                for (uint256 j = 0; j < i; j++) {
                    if (numbers[j] == uint8(rand)) {
                        unique = false;
                        nonce++;
                        break;
                    }
                }
                if (unique) numbers[i] = uint8(rand);
            }
        }

        tickets.push(Ticket({ player: msg.sender, numbers: numbers, round: round, prize: 0 }));
        ticketsBought[msg.sender] += 1;

        emit TicketBought(msg.sender, numbers, round, msg.value);
    }

    function drawNumbers() external onlyOwner {
        require(tickets.length > 0, "No tickets");

        // Генерация 6 уникальных чисел
        uint8[6] memory drawn;
        uint256 nonce = 0;
        for (uint256 i = 0; i < 6; i++) {
            bool unique = false;
            while (!unique) {
                uint256 rand =
                    (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, nonce, i, round))) %
                        MAX_NUMBER) + 1;
                unique = true;
                for (uint256 j = 0; j < i; j++) {
                    if (drawn[j] == uint8(rand)) {
                        unique = false;
                        nonce++;
                        break;
                    }
                }
                if (unique) drawn[i] = uint8(rand);
            }
        }
        lastDrawnNumbers = drawn;

        // Считаем выигрыши и начисляем призы
        for (uint256 i = 0; i < tickets.length; i++) {
            uint256 matches = 0;
            for (uint256 j = 0; j < 6; j++) {
                for (uint256 k = 0; k < 6; k++) {
                    if (tickets[i].numbers[j] == drawn[k]) {
                        matches++;
                        break;
                    }
                }
            }
            uint256 prize = 0;
            if (matches == 6) prize = 100 ether;
            else if (matches == 5) prize = 10 ether;
            else if (matches == 4) prize = 1 ether;
            else if (matches == 3) prize = 0.1 ether;

            if (prize > 0) {
                lastPrize[tickets[i].player] += prize;
                wins[tickets[i].player] += 1;
                // Перевод ETH победителю
                (bool ok, ) = payable(tickets[i].player).call{ value: prize }("");
                require(ok, "Prize transfer failed");
                emit PrizePaid(tickets[i].player, prize, uint8(matches), round);
            }
        }

        emit NumbersDrawn(drawn, round, tickets.length);

        delete tickets;
        round += 1;
    }

    function resetRound() external onlyOwner {
        delete tickets;
        round += 1;
    }

    // Пополнение банка лотереи (чтобы хватало на призы)
    receive() external payable {}
}
