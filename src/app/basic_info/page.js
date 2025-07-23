'use client';
import Form from "next/form";
import {FormField} from "@/components/form/FormField";
import {Options} from "@/components/form/Options";
import {useEffect, useState} from "react";
import {getUsages, reachedMaxOfUsages} from "@/lib/domain-utils";
import {ConsentModal} from "@/components/ConsentModal";
import {usePushWithQuery} from "@/hooks/usePushWithQuery";
import { UserData, USERDATA_DEFAULTS } from "@/lib/UserData";
import { MaxUsagesSubtext } from "@/components/MaxUsagesSubtext";
import { NumberInput } from "@/components/form/NumberInput";
import { getSexOptions, getHypertensionOptions, getCameraOptions } from "@/constants/options";
import styles from './page.module.css'

export default function BasicInfo() {
  const push = usePushWithQuery();
  const [defaultValues, setDefaultValues] = useState(USERDATA_DEFAULTS)
  const [reachedMaxUsages, setReachedMaxUsages] = useState(false)
  const [usages, setUsages] = useState(0)
  const [dialogOpened, setDialogOpened] = useState(false)
  const [formData, setFormData] = useState()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const initialData = localStorage.getItem("data");
    if (initialData) {
      try {
        const parsed = UserData.from(initialData);
        setDefaultValues(parsed.toDefaultValue());
      } catch {
        setDefaultValues(USERDATA_DEFAULTS)
      }
    } else {
      setDefaultValues(USERDATA_DEFAULTS)
    }
    setShow(true);

    if (reachedMaxOfUsages()) {
      setReachedMaxUsages(true);
    } else {
      setReachedMaxUsages(false);
    }
    setUsages(getUsages())
  }, []);

  const handleSubmit = (formData) => {
    setFormData(formData)
    setDialogOpened(true)
  };

  const handleAccept = () => {
    if (!formData) return;
    const data = Object.fromEntries(formData);
    const value = new UserData({
      height: parseInt(data.height),
      weight: parseInt(data.weight),
      sex: UserData.sexToNumber(data.sex),
      age: new Date().getFullYear() - data.birthYear,
      bp_mode: "ternary",
      bp_group: data.hypertension,
      facing_mode: data.camera
    });
    localStorage.setItem("data", value.toJSON());
    push("/scan");
  }

  return (
    show && <div className="container">
      <h1>Información</h1>
      <MaxUsagesSubtext reachedMaxUsages={reachedMaxUsages} usages={usages} />

      <Form id="vitalsForm" action={handleSubmit}>
        <FormField title="Género">
          <Options name="sex" options={getSexOptions(defaultValues.sex)}/>
        </FormField>

        <FormField title="Altura">
          <div className="input-group">
            <NumberInput id="eid_height" name="height" defaultValue={defaultValues.height} />
            <span className="unit">Cm.</span>
          </div>
        </FormField>

        <FormField title="Peso">
          <div className="input-group">
            <NumberInput id="eid_weight" name="weight" defaultValue={defaultValues.weight} />
            <span className="unit">Kg.</span>
          </div>
        </FormField>

        <FormField title="Año de Nacimiento">
          <NumberInput id="eid_birth" name="birthYear" defaultValue={defaultValues.birthYear} />
        </FormField>

        <FormField title="¿Cuál es tu presión en sangre regular (SBP)?">
          <Options name="hypertension" options={getHypertensionOptions(defaultValues.hypertension)} column/>
        </FormField>

        <FormField title="Camara">
          <Options name="camera" options={getCameraOptions(defaultValues.camera)}/>
        </FormField>

        <SubmitSection reachedMaxUsages={reachedMaxUsages} />
      </Form>
      <ConsentModal onAccept={handleAccept} open={dialogOpened} onClose={() => setDialogOpened(false)} />
    </div>
  );
}


function SubmitSection({ reachedMaxUsages }) {
  return (
    <div className={styles.submitSection}>
      {reachedMaxUsages && (
        <div className="alert alert-warning">
          Has alcanzado el máximo de usos permitidos. Por favor, contacta con el soporte para más información.
        </div>
      )}
      <button disabled={reachedMaxUsages} type="submit" className="btn-next" id="eid_btn_next">Comenzar</button>
    </div>
  );
}