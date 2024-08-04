import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";

import Header from "../Header/Header";
import "./TransactionsList.css";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/expenses`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const sortedData = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setTransactions(sortedData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions");
      }
    };

    fetchTransactions();
  }, []);

  const handleAddTransactionClick = () => {
    navigate("/add-transaction");
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }
      setTransactions(
        transactions.filter((transaction) => transaction.id !== id)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError("Failed to delete transaction");
    }
  };

  const calculateRunningBalances = (transactions) => {
    let runningBalance = 0;
    const reversedTransactions = [...transactions].reverse(); // Reversing transactions before calculation
    const transactionsWithBalances = reversedTransactions.map((transaction) => {
      runningBalance +=
        transaction.type === "credit"
          ? transaction.amount
          : -transaction.amount;
      return { ...transaction, running_balance: runningBalance };
    });
    return transactionsWithBalances.reverse(); // Reversing transactions back to original order
  };

  const transactionsWithBalances = calculateRunningBalances(transactions);

  return (
    <div className="transactions-container">
      <Header />
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Office Transaction</th>
            <th></th>
            <th></th>
            <th></th>
            <th>
              <button onClick={handleAddTransactionClick}>
                + Add Transaction
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Credit</th>
            <th>Debit</th>
            <th></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan="6">{error}</td>
            </tr>
          )}
          {transactionsWithBalances.length > 0 ? (
            transactionsWithBalances.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  {new Date(transaction.date).toLocaleDateString("en-US")}
                </td>
                {/* Format date */}
                <td>{transaction.description}</td>
                <td className="credit">
                  {transaction.type === "credit" && transaction.amount}
                </td>
                <td className="debit">
                  {transaction.type === "debit" && "- " + transaction.amount}
                </td>
                <td className="running_balance">
                  {transaction.running_balance}
                </td>
                <td>
                  <button
                    className="deleteBtn"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                  >
                    <MdDeleteOutline size={25} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* <div></div> */}
    </div>
  );
};

export default TransactionsList;
