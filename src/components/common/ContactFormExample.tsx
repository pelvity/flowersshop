'use client';

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { User, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { FormButton } from "../ui/FormButton";
import { StatusMessage } from "../ui/StatusMessage";
import { SmartFormField } from "../ui/form/FormField";
import { useForm } from "@/hooks/useForm";
import { FIELD_CONFIGS, ValidationRule } from "@/lib/form-utils";
import { sendEmail } from "@/utils/send-email";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactFormExample() {
  const t = useTranslations('common');
  const [submitStatus, setSubmitStatus] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  // Define form fields with configurations
  const formFields = [
    {
      name: 'name',
      presetConfig: 'NAME',
      initialValue: '',
      validations: [
        { 
          type: 'required', 
          message: t('nameRequired') 
        },
        { 
          type: 'minLength', 
          value: 2, 
          message: t('nameRequired') 
        }
      ] as ValidationRule[]pl
    },
    {
      name: 'email',
      presetConfig: 'EMAIL',
      initialValue: '',
      validations: [
        { 
          type: 'required', 
          message: t('emailRequired') 
        },
        { 
          type: 'email', 
          message: t('emailInvalid') 
        }
      ] as ValidationRule[]
    },
    {
      name: 'phone',
      presetConfig: 'PHONE',
      initialValue: '',
      validations: [
        { 
          type: 'phone', 
          message: t('phoneInvalid') 
        }
      ] as ValidationRule[]
    },
    {
      name: 'message',
      presetConfig: 'MESSAGE',
      initialValue: '',
      validations: [
        { 
          type: 'required', 
          message: t('messageRequired') 
        },
        { 
          type: 'minLength', 
          value: 10, 
          message: t('messageMinLength') 
        }
      ] as ValidationRule[]
    }
  ];

  // Use our form hook
  const { 
    values, 
    errors, 
    touched,
    isSubmitting, 
    handleSubmit, 
    getFieldProps,
    resetForm
  } = useForm({
    fields: formFields,
    validateOnBlur: true,
    onSubmit: async (formValues) => {
      setSubmitStatus({ status: 'idle', message: '' });
      
      try {
        const result = await sendEmail(formValues as FormData);
        
        if (result.success) {
          setSubmitStatus({
            status: 'success',
            message: t('emailSent')
          });
          resetForm();
        } else {
          setSubmitStatus({
            status: 'error',
            message: result.error || t('emailError')
          });
        }
      } catch (error) {
        setSubmitStatus({
          status: 'error',
          message: t('emailError')
        });
        console.error('Form submission error:', error);
      }
      
      // Auto-clear success message after 5 seconds
      if (submitStatus.status === 'success') {
        setTimeout(() => {
          setSubmitStatus({ status: 'idle', message: '' });
        }, 5000);
      }
    }
  });

  return (
    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
      {/* Status Messages */}
      <StatusMessage
        type={submitStatus.status}
        message={submitStatus.message}
      />
      
      {/* Smart form fields using our new components */}
      <SmartFormField
        id="name"
        name="name"
        label={t('name')}
        required
        placeholder={t('yourName')}
        icon={User}
        hookProps={getFieldProps('name')}
        autoComplete="name"
      />
      
      <SmartFormField
        id="email"
        name="email"
        label={t('contactEmail')}
        required
        placeholder={t('yourEmail')}
        icon={Mail}
        hookProps={getFieldProps('email')}
        autoComplete="email"
      />
      
      <SmartFormField
        id="phone"
        name="phone"
        label={t('phone')}
        placeholder={t('yourPhone')}
        icon={Phone}
        hookProps={getFieldProps('phone')}
        autoComplete="tel"
      />
      
      <SmartFormField
        id="message"
        name="message"
        type="textarea"
        label={t('message')}
        required
        placeholder={t('howCanWeHelp')}
        icon={MessageSquare}
        hookProps={getFieldProps('message')}
        rows={4}
      />
      
      <div className="pt-2">
        <FormButton
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText={t('sending')}
          icon={Send}
        >
          {t('send')}
        </FormButton>
      </div>
    </form>
  );
} 