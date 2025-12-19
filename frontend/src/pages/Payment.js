import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paymentService, patientService, insuranceService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Payment() {
  const { user } = useAuth();
  const { patientId: urlPatientId } = useParams();
  const [patientId, setPatientId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [billingAddress, setBillingAddress] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvv: '',
    expiry: '',
    nameOnCard: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Find patient by email from logged-in user
  useEffect(() => {
    const findPatient = async () => {
      if (urlPatientId) {
        setPatientId(urlPatientId);
        return;
      }

      if (!user?.email) {
        setError('Please log in to view payments');
        setLoading(false);
        return;
      }

      try {
        const patientsResponse = await patientService.getAll();
        const patients = patientsResponse.data;
        const patient = patients.find(p => p.email === user.email);
        
        if (patient) {
          setPatientId(patient.id.toString());
          setBillingAddress(patient.address || '');
        } else {
          setError('Patient record not found. Please contact support.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error finding patient:', err);
        // Don't block the page - show error but allow user to see UI
        const errorMessage = err.response?.data?.message || 'Failed to load patient information. Please try again.';
        setError(errorMessage);
        setLoading(false);
        // DON'T call logout - let user stay logged in
      }
    };

    findPatient();
  }, [user, urlPatientId]);

  // Load payments and insurance when patientId is available
  useEffect(() => {
    if (!patientId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const [paymentsResponse, insuranceResponse] = await Promise.all([
          paymentService.getByPatientId(patientId),
          insuranceService.getCurrentByPatientId(patientId).catch((err) => {
            // Insurance might not exist, that's okay
            console.log('No insurance found:', err);
            return { data: null };
          })
        ]);
        
        setPayments(paymentsResponse.data || []);
        setInsurance(insuranceResponse.data);
        
        // Set first unpaid bill as selected
        const unpaidBill = paymentsResponse.data?.find(p => p.status !== 'COMPLETED');
        if (unpaidBill) {
          setSelectedBillId(unpaidBill.id);
        }
      } catch (err) {
        console.error('Error loading payments:', err);
        // Show error but don't block the UI
        const errorMessage = err.response?.data?.message || 'Failed to load payment information. Please try again.';
        setError(errorMessage);
        // DON'T call logout - let user stay logged in
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const selectedBill = payments.find((bill) => bill.id === selectedBillId);

  const outstandingBase = useMemo(
    () => payments.filter((bill) => bill.status !== 'COMPLETED').reduce((total, bill) => total + parseFloat(bill.amount || 0), 0),
    [payments]
  );

  const getStatusClass = (status) => {
    if (status === 'COMPLETED') return 'status-paid';
    if (status === 'OVERDUE') return 'status-overdue';
    return 'status-due';
  };

  const handlePayNow = (billId) => {
    setSelectedBillId(billId);
    setSuccessMessage('');
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!selectedBill) return;

    try {
      await paymentService.update(selectedBill.id, {
        ...selectedBill,
        status: 'COMPLETED',
        paymentMethod: paymentMethod
      });
      
      setSuccessMessage(`Payment of $${parseFloat(selectedBill.amount).toFixed(2)} was successful.`);
      
      // Reload payments
      const paymentsResponse = await paymentService.getByPatientId(patientId);
      setPayments(paymentsResponse.data || []);
      
      setSelectedBillId(null);
      setCardDetails({ cardNumber: '', cvv: '', expiry: '', nameOnCard: '' });
    } catch (err) {
      console.error('Error processing payment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to process payment. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      // DON'T call logout - let user stay logged in
    }
  };

  if (loading) {
    return (
      <div data-testid="payment-page">
        <div className="page-header">
          <h1>Payments</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !payments.length) {
    return (
      <div data-testid="payment-page">
        <div className="page-header">
          <h1>Payments</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="payment-page">
      <div className="page-header">
        <h1>Payments</h1>
        <p>Settle medical bills, apply insurance coverage, and manage payment plans.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="payment-summary">
        <div className="summary-card">
          <p className="eyebrow">Total Outstanding</p>
          <h2>${outstandingBase.toFixed(2)}</h2>
          <p className="muted">All outstanding bills</p>
        </div>
        <div className="summary-card">
          <p className="eyebrow">Insurance Coverage</p>
          <h2>{insurance ? insurance.provider : 'Not Available'}</h2>
          <p className="muted">{insurance ? insurance.coverageType : 'No active insurance'}</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert success" role="alert">
          {successMessage}
        </div>
      )}

      <div className="payment-layout">
        <div className="card">
          <div className="table-header">
            <h3>Bills</h3>
            <span className="muted">Pay individually or set a plan.</span>
          </div>
          <div className="table-wrapper">
            <table className="results-table" data-testid="payment-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <p className="muted">No payment records found.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.id}</td>
                      <td>${parseFloat(bill.amount || 0).toFixed(2)}</td>
                      <td>{bill.paymentDate || 'N/A'}</td>
                      <td>{bill.paymentMethod || 'N/A'}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(bill.status)}`}>{bill.status}</span>
                      </td>
                      <td className="text-right">
                        {bill.status !== 'COMPLETED' ? (
                          <button className="btn btn-primary btn-compact" onClick={() => handlePayNow(bill.id)}>
                            Pay Now
                          </button>
                        ) : (
                          <span className="muted">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
                  <h4>Payment #{selectedBill.id}</h4>
                  <p className="muted">Amount: ${parseFloat(selectedBill.amount || 0).toFixed(2)}</p>
                </div>
                <div className="summary-breakdown">
                  <div className="breakdown-row total">
                    <span>Amount Due</span>
                    <span>${parseFloat(selectedBill.amount || 0).toFixed(2)}</span>
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

              {paymentMethod !== 'Bank Transfer' && paymentMethod !== 'Insurance' && (
                <div className="form-grid">
                  <div className="field">
                    <label>Card number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Name on card</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={cardDetails.nameOnCard}
                      onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Billing address</label>
                <textarea
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, City, State, Zip"
                />
              </div>

              <button type="submit" className="btn btn-primary full-width">
                Pay ${parseFloat(selectedBill.amount || 0).toFixed(2)}
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

      {payments.filter(p => p.status === 'COMPLETED').length > 0 && (
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
                  <th>Payment ID</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .filter(p => p.status === 'COMPLETED')
                  .map((item) => (
                    <tr key={item.id}>
                      <td>{item.paymentDate || 'N/A'}</td>
                      <td>{item.id}</td>
                      <td>${parseFloat(item.amount || 0).toFixed(2)}</td>
                      <td>{item.paymentMethod || 'N/A'}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(item.status)}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
