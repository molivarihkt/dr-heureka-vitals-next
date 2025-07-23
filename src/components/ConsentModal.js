import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import styles from "@/app/basic_info/page.module.css";


export function ConsentModal({open, onClose, onAccept}) {
  const dialogRef = useRef(null);
  const {t} = useTranslation("", {keyPrefix: "calibrationModal"});
  const [canAccept, setCanAccept] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => {
          if (dialog) {
            dialog.scrollTop = 0;
          }
        }, 0);
        dialog.addEventListener('scroll', () => {
          if (dialog.scrollTop + dialog.clientHeight >= dialog.scrollHeight) {
            setCanAccept(true);
          } else {
            setCanAccept(false);
          }
        })
      }
    } else {
      if (dialog.open) {
        dialog.close();
        dialog.removeEventListener('scroll')
      }
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      if (onClose) onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      data-testid="consent-modal"
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <button
          className="btn-cross"
          onClick={() => dialogRef.current.close()}
          style={{alignSelf: 'flex-end'}}
        >X</button>
        <h1 className="modal-h1">{t("title")}</h1>
        <p className="modal-p">{t("text1")}</p>
        <p className="modal-p">{t("text2")}</p>
        <p className="modal-p">{t("text3")}</p>
        <h2 className="modal-h2">{t("subtitle")}</h2>
        <p className="modal-p">{t("text4")}</p>
        <div className="action-buttons">
          <button onClick={() => dialogRef.current.close()} className="btn-secondary btn-close">
                        Cerrar
          </button>
          <button
            disabled={!canAccept}
            onClick={onAccept}
            className="btn-primary"
          >
                        Aceptar
          </button>
        </div>
      </div>
    </dialog>
  );
}