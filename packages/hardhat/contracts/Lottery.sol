// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Lottery
 * @notice Простая лотерея: участники покупают «билеты» (виртуальные),
 *         владелец выбирает победителя вручную и начисляет приз.
 * @dev Учебный проект, без реальных денег. Все операции — на локальной сети Hardhat.
 */
contract Lottery {
    // ===== State =====
    address public immutable owner;
    address[] public players;                 // текущий раунд
    address public lastWinner;                // последний победитель
    uint256 public round;                     // номер раунда
    mapping(address => uint256) public wins;  // сколько раз выигрывал каждый

    uint256 public constant PRIZE = 10;       // виртуальный приз
    uint256 public constant TICKET_PRICE = 1; // виртуальная цена билета

    // ===== Events =====
    event TicketBought(address indexed player, uint256 round, uint256 totalPlayers);
    event WinnerPicked(address indexed winner, uint256 prize, uint256 round, uint256 totalPlayers);

    // ===== Modifiers =====
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier hasPlayers() {
        require(players.length > 0, "No players");
        _;
    }

    // ===== Constructor =====
    constructor() {
        owner = msg.sender; // деплойер = организатор лотереи
    }

    // ===== READ =====
    /// @notice Список участников текущего раунда
    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    /// @notice Количество участников
    function getPlayersCount() external view returns (uint256) {
        return players.length;
    }

    /// @notice Последний победитель и номер раунда
    function getWinner() external view returns (address, uint256) {
        return (lastWinner, round);
    }

    /// @notice Сколько раз адрес выигрывал
    function getWins(address player) external view returns (uint256) {
        return wins[player];
    }

    // ===== WRITE =====
    /// @notice Купить билет (попасть в список участников текущего раунда)
    function buyTicket() external {
        for (uint256 i = 0; i < players.length; i++) {
            require(players[i] != msg.sender, "Already in this round");
        }
        players.push(msg.sender);
        emit TicketBought(msg.sender, round, players.length);
    }

    /// @notice Выбрать победителя (только владелец)
    function pickWinner() external onlyOwner hasPlayers {
        uint256 idx = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, players.length, round))
        ) % players.length;

        address winner = players[idx];
        lastWinner = winner;
        wins[winner] += 1;

        emit WinnerPicked(winner, PRIZE, round, players.length);

        // Сброс раунда
        delete players;
        round += 1;
    }
}