'use client'
import i18n from "../i18n"
import {useParams, useSearchParams} from "next/navigation";

export const I18NProvider = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
}


export const LineValidatorProvider = ({ children, numberWhitelist }) => {
  const params = useSearchParams();

  const lineBase64 = params.get("line");
  const line = lineBase64 ? atob(lineBase64) : null;

  if (!line || !numberWhitelist.includes(line)) {
    return <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      gap: "1rem",
    }}>
      <img src="images/cross.png" alt="Cross icon" width={300} />
      <h2>
No tienes los permisos necesarios para utilizar esta aplicacion.
      </h2>
      <p>
        Contactate con soporte.
      </p>
    </div>
  }

  return (
    <>
      {children}
    </>
  );
}