import React, { useMemo, useState } from 'react';

const initialBills = [
  { id: 'INV-2001', service: 'Lab Tests', amount: 250, status: 'Due Soon', date: '2025-12-15', dueDate: '2026-01-15' },
  { id: 'INV-2002', service: 'Doctor Consultation', amount: 150, status: 'Paid', date: '2025-12-01', dueDate: '2025-12-10' },
  { id: 'INV-2003', service: 'X-Ray', amount: 300, status: 'Overdue', date: '2025-11-15', dueDate: '2025-12-01' },
  { id: 'INV-2004', service: 'Blood Work', amount: 180, status: 'Due Soon', date: '2025-12-18', dueDate: '2026-01-20' },
  { id: 'INV-2005', service: 'Annual Checkup', amount: 200, status: 'Paid', date: '2025-11-01', dueDate: '2025-11-10' },
];

const initialHistory = [
  { date: '2025-12-05', invoice: 'INV-2002', amount: 150, method: 'Credit Card', receipt: 'RCT-54721' },
  { date: '2025-11-12', invoice: 'INV-2005', amount: 200, method: 'Debit Card', receipt: 'RCT-49213' },
  { date: '2025-10-28', invoice: 'INV-1999', amount: 120, method: 'Bank Transfer', receipt: 'RCT-12088' },
];

const coverageRate = 0.2; // 20% insurance coverage applied to outstanding balances

function Payment() {
  const [bills, setBills] = useState(initialBills);
  const [paymentHistory, setPaymentHistory] = useState(initialHistory);
  const [selectedBillId, setSelectedBillId] = useState(initialBills.find((bill) => bill.status !== 'Paid')?.id || null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [billingAddress, setBillingAddress] = useState('123 Wellness Ave, New York, NY 10029');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvv: '',
    expiry: '',
    nameOnCard: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [receiptMessage, setReceiptMessage] = useState('');
  const [planTerm, setPlanTerm] = useState(6);
  const [planBillId, setPlanBillId] = useState(initialBills.find((bill) => bill.status !== 'Paid')?.id || null);

  const selectedBill = bills.find((bill) => bill.id === selectedBillId);
  const planBill = bills.find((bill) => bill.id === planBillId);

  const outstandingBase = useMemo(
    () => bills.filter((bill) => bill.status !== 'Paid').reduce((total, bill) => total + bill.amount, 0),
    [bills]
  );

  const insuranceCoverage = useMemo(
    () => bills.filter((bill) => bill.status !== 'Paid').reduce((total, bill) => total + bill.amount * coverageRate, 0),
    [bills]
  );

  const outstandingAfterCoverage = Math.max(outstandingBase - insuranceCoverage, 0);

  const getStatusClass = (status) => {
    if (status === 'Paid') return 'status-paid';
    if (status === 'Overdue') return 'status-overdue';
    return 'status-due';
  };

  const getPatientResponsibility = (bill) => {
    if (!bill) return 0;
    const covered = bill.amount * coverageRate;
    return Math.max(bill.amount - covered, 0);
  };

  const handlePayNow = (billId) => {
    setSelectedBillId(billId);
    setSuccessMessage('');
    setReceiptMessage('');
  };

  const handlePayment = (event) => {
    event.preventDefault();
    if (!selectedBill) return;

    const covered = selectedBill.amount * coverageRate;
    const patientPortion = getPatientResponsibility(selectedBill);
    const today = new Date().toISOString().split('T')[0];
    const receiptId = `RCT-${Math.floor(Math.random() * 90000) + 10000}`;

    setBills((prev) =>
      prev.map((bill) =>
        bill.id === selectedBill.id ? { ...bill, status: 'Paid', paidDate: today } : bill
      )
    );

    setPaymentHistory((prev) => [
      { date: today, invoice: selectedBill.id, amount: patientPortion, method: paymentMethod, receipt: receiptId },
      ...prev,
    ]);

    setSuccessMessage(`Payment of $${patientPortion.toFixed(2)} for ${selectedBill.service} was successful.`);
    setReceiptMessage(`Receipt ${receiptId} emailed with $${covered.toFixed(2)} insurance coverage applied.`);
    setSelectedBillId(null);
  };

  const handleReceiptDownload = (receiptId) => {
    setReceiptMessage(`Receipt ${receiptId} emailed and ready for download.`);
  };

  const monthlyPlanAmount = planBill ? getPatientResponsibility(planBill) / planTerm : 0;

  return (
    <div data-testid="payment-page">
      <div className="page-header">
        <h1>Payments</h1>
        <p>Settle medical bills, apply insurance coverage, and manage payment plans.</p>
      </div>

      <div className="payment-summary">
        <div className="summary-card">
          <p className="eyebrow">Total Outstanding (after insurance)</p>
          <h2>${outstandingAfterCoverage.toFixed(2)}</h2>
          <p className="muted">Coverage applied: ${insuranceCoverage.toFixed(2)} ({Math.round(coverageRate * 100)}%)</p>
        </div>
        <div className="summary-card">
          <p className="eyebrow">Next Due Date</p>
          <h2>{bills.find((b) => b.status !== 'Paid')?.dueDate || 'All paid'}</h2>
          <p className="muted">Stay current to avoid late fees.</p>
        </div>
        <div className="summary-card">
          <p className="eyebrow">Insurance Coverage</p>
          <h2>${insuranceCoverage.toFixed(2)}</h2>
          <p className="muted">Applied automatically to eligible bills.</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert success" role="alert">
          {successMessage}
          <div className="muted">{receiptMessage}</div>
        </div>
      )}

      <div className="payment-layout">
      <div className="card">
          <div className="table-header">
            <h3>Outstanding Bills</h3>
            <span className="muted">Pay individually or set a plan.</span>
          </div>
          <div className="table-wrapper">
        <table className="results-table" data-testid="payment-table">
          <thead>
            <tr>
                  <th>Invoice #</th>
              <th>Service</th>
              <th>Date</th>
                  <th>Amount Due</th>
                  <th>Due Date</th>
              <th>Status</th>
                  <th />
            </tr>
          </thead>
          <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>{bill.service}</td>
                    <td>{bill.date}</td>
                    <td>${bill.amount.toFixed(2)}</td>
                    <td>{bill.dueDate}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(bill.status)}`}>{bill.status}</span>
                    </td>
                    <td className="text-right">
                      {bill.status !== 'Paid' ? (
                        <button className="btn btn-primary btn-compact" onClick={() => handlePayNow(bill.id)}>
                          Pay Now
                        </button>
                      ) : (
                        <span className="muted">Settled</span>
                      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>

        <div className="card payment-form-card">
          <div className="table-header">
            <h3>Payment Form</h3>
            <span className="muted">Select a bill to see the breakdown.</span>
          </div>

          {selectedBill ? (
            <form className="payment-form" onSubmit={handlePayment}>
              <div className="bill-summary">
                <div>
                  <p className="eyebrow">Bill Summary</p>
                  <h4>{selectedBill.service}</h4>
                  <p className="muted">
                    Invoice {selectedBill.id} · Due {selectedBill.dueDate}
                  </p>
                </div>
                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Amount</span>
                    <span>${selectedBill.amount.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Insurance coverage</span>
                    <span className="muted">- ${ (selectedBill.amount * coverageRate).toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span>Patient responsibility</span>
                    <span>${getPatientResponsibility(selectedBill).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Payment Method</label>
                <div className="method-grid">
                  {['Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      className={`method-pill ${paymentMethod === method ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Card number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    required={paymentMethod !== 'Bank Transfer' && paymentMethod !== 'Insurance'}
                  />
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    required={paymentMethod !== 'Bank Transfer' && paymentMethod !== 'Insurance'}
                  />
                </div>
                <div className="field">
                  <label>Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    required={paymentMethod !== 'Bank Transfer' && paymentMethod !== 'Insurance'}
                  />
                </div>
                <div className="field">
                  <label>Name on card</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={cardDetails.nameOnCard}
                    onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                    required={paymentMethod !== 'Bank Transfer' && paymentMethod !== 'Insurance'}
                  />
                </div>
              </div>

              <div className="field">
                <label>Billing address</label>
                <textarea
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, City, State, Zip"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary full-width">
                Pay ${getPatientResponsibility(selectedBill).toFixed(2)}
              </button>
              <p className="muted tiny-text">A confirmation and receipt will be emailed after payment.</p>
            </form>
          ) : (
            <div className="empty-state">
              <p className="muted">Select an unpaid bill to start a payment.</p>
            </div>
          )}
        </div>
      </div>

      <div className="payment-grid">
        <div className="card">
          <div className="table-header">
            <h3>Payment History</h3>
            <span className="muted">Recent payments and receipts.</span>
          </div>
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((item) => (
                  <tr key={`${item.invoice}-${item.receipt}`}>
                    <td>{item.date}</td>
                    <td>{item.invoice}</td>
                    <td>${item.amount.toFixed(2)}</td>
                    <td>{item.method}</td>
                    <td>
                      <button className="btn btn-ghost btn-compact" onClick={() => handleReceiptDownload(item.receipt)}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="table-header">
            <h3>Payment Plans</h3>
            <span className="muted">Split larger balances into monthly payments.</span>
          </div>

          <div className="field">
            <label>Select Bill</label>
            <select value={planBillId || ''} onChange={(e) => setPlanBillId(e.target.value)}>
              {bills
                .filter((bill) => bill.status !== 'Paid')
                .map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    {bill.service} ({bill.id})
                  </option>
                ))}
            </select>
          </div>

          <div className="field">
            <label>Plan term</label>
            <div className="method-grid">
              {[3, 6, 12].map((term) => (
                <button
                  type="button"
                  key={term}
                  className={`method-pill ${planTerm === term ? 'selected' : ''}`}
                  onClick={() => setPlanTerm(term)}
                >
                  {term} months
                </button>
              ))}
            </div>
          </div>

          {planBill ? (
            <div className="plan-summary">
              <div className="breakdown-row">
                <span>Bill</span>
                <span>{planBill.service}</span>
              </div>
              <div className="breakdown-row">
                <span>Amount after insurance</span>
                <span>${getPatientResponsibility(planBill).toFixed(2)}</span>
              </div>
              <div className="breakdown-row total">
                <span>Monthly amount</span>
                <span>${monthlyPlanAmount.toFixed(2)}</span>
              </div>
              <p className="muted tiny-text">Insurance coverage is applied before calculating the monthly amount.</p>
            </div>
          ) : (
            <p className="muted">All bills are paid. Great job!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payment;

