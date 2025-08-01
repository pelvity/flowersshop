'use client';

import { Button } from "../ui";
import { useTranslations } from 'next-intl';
import { useState, useMemo } from "react";
import { sendEmail } from "@/utils/send-email";
import { User, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { FormButton, StatusMessage } from "../ui/form";
import { SmartFormField } from "../ui/form/FormField";
import { useForm } from "@/hooks/useForm";
import { ValidationRule, sanitizePhoneInput, formatPhoneNumber } from "@/lib/form-utils";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactForm() {
  const commonT = useTranslations('common');
  const [submitStatus, setSubmitStatus] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  // Define form fields with configurations - memoize to prevent re-renders
  const formFields = useMemo(() => [
    {
      name: 'name',
      initialValue: '',
      validations: [
        { type: 'required', message: commonT('nameRequired') },
        { type: 'minLength', value: 2, message: commonT('nameRequired') }
      ] as ValidationRule[]
    },
    {
      name: 'email',
      initialValue: '',
      validations: [
        { type: 'required', message: commonT('emailRequired') },
        { type: 'email', message: commonT('emailInvalid') }
      ] as ValidationRule[]
    },
    {
      name: 'phone',
      initialValue: '',
      formatOnChange: sanitizePhoneInput,
      formatOnBlur: formatPhoneNumber,
      validations: [
        { 
          type: 'phone', 
          message: commonT('phoneInvalid') 
        }
      ] as ValidationRule[]
    },
    {
      name: 'message',
      initialValue: '',
      validations: [
        { type: 'required', message: commonT('messageRequired') },
        { 
          type: 'minLength', 
          value: 10, 
          message: commonT('messageMinLength') 
        }
      ] as ValidationRule[]
    }
  ], [commonT]); // Only depend on commonT
  
  // Handle successful submission separately to avoid referencing submitStatus in onSubmit
  const handleSubmitSuccess = () => {
    setTimeout(() => {
      setSubmitStatus({ status: 'idle', message: '' });
    }, 5000);
  };
  
  // Use our form hook
  const { 
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
            message: commonT('emailSent')
          });
          resetForm();
          handleSubmitSuccess();
        } else {
          setSubmitStatus({
            status: 'error',
            message: result.error || commonT('emailError')
          });
        }
      } catch (error) {
        setSubmitStatus({
          status: 'error',
          message: commonT('emailError')
        });
        console.error('Form submission error:', error);
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
      
      <SmartFormField
        id="name"
        name="name"
        label={commonT('name')}
        required
        placeholder={commonT('yourName')}
        icon={User}
        hookProps={getFieldProps('name')}
        autoComplete="name"
      />
      
      <SmartFormField
        id="email"
        name="email"
        label={commonT('contactEmail')}
        required
        placeholder={commonT('yourEmail')}
        icon={Mail}
        hookProps={getFieldProps('email')}
        autoComplete="email"
      />
      
      <SmartFormField
        id="phone"
        name="phone"
        label={commonT('phone')}
        placeholder={commonT('yourPhone')}
        icon={Phone}
        hookProps={getFieldProps('phone')}
        autoComplete="tel"
      />
      
      <SmartFormField
        id="message"
        name="message"
        type="textarea"
        label={commonT('message')}
        required
        placeholder={commonT('howCanWeHelp')}
        icon={MessageSquare}
        hookProps={getFieldProps('message')}
        rows={4}
      />
      
      <div className="pt-2">
        <FormButton
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText={commonT('sending')}
          icon={Send}
        >
          {commonT('send')}
        </FormButton>
      </div>
    </form>
  );
} 