import React, { useEffect } from 'react';
import styles from './Toast.module.css';

const Toast = ({ show, onClose, message = 'Success!' }) => {
  useEffect(() => {
    let timer;
    if (show) {
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.toastContainer}>
      <div className={styles.toastIcon}>
        <img src="images/check.svg" alt="Success" style={{ width: '20px', height: '20px' }} />
      </div>
      <div className={styles.toastMessage}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
