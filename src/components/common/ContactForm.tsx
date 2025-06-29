'use client';

import { Button } from "../ui";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendEmail } from "@/utils/send-email";
import { User, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { FormField, FormButton, StatusMessage } from "../ui/form";
import { validateEmail, validateMinLength, validatePhone, sanitizePhoneInput } from "@/utils/form-validation";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactForm() {
  const commonT = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    formState: { errors } 
  } = useForm<FormData>();
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Sanitize the phone input to remove any non-digit or non-allowed characters
    const sanitized = sanitizePhoneInput(e.target.value);
    setValue('phone', sanitized);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ status: 'idle', message: '' });
    
    try {
      const result = await sendEmail(data);
      
      if (result.success) {
        setSubmitStatus({
          status: 'success',
          message: commonT('emailSent')
        });
        reset(); // Reset form fields on success
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
    } finally {
      setIsSubmitting(false);
      // Auto-clear success message after 5 seconds
      if (submitStatus.status === 'success') {
        setTimeout(() => {
          setSubmitStatus({ status: 'idle', message: '' });
        }, 5000);
      }
    }
  };

  return (
    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Status Messages */}
      <StatusMessage
        type={submitStatus.status}
        message={submitStatus.message}
      />
      
      <FormField
        id="name"
        name="name"
        type="text"
        label={commonT('name')}
        required
        placeholder={commonT('yourName')}
        icon={User}
        register={register}
        rules={{
          required: commonT('nameRequired'),
          minLength: {
            value: 2,
            message: commonT('nameRequired')
          }
        }}
        error={errors.name}
        autoComplete="name"
      />
      
      <FormField
        id="email"
        name="email"
        type="email"
        label={commonT('contactEmail')}
        required
        placeholder={commonT('yourEmail')}
        icon={Mail}
        register={register}
        rules={{
          required: commonT('emailRequired'),
          validate: {
            validEmail: (value) => validateEmail(value) || commonT('emailInvalid')
          }
        }}
        error={errors.email}
        autoComplete="email"
      />
      
      <FormField
        id="phone"
        name="phone"
        type="tel"
        label={commonT('phone')}
        placeholder={commonT('yourPhone')}
        icon={Phone}
        register={register}
        rules={{
          validate: {
            validPhoneIfProvided: (value) => {
              if (value && value.trim() !== '' && !validatePhone(value)) {
                return commonT('phoneInvalid') || 'Invalid phone number';
              }
              return true;
            }
          }
        }}
        error={errors.phone}
        autoComplete="tel"
        onChange={handlePhoneChange}
      />
      
      <FormField
        id="message"
        name="message"
        type="textarea"
        label={commonT('message')}
        required
        placeholder={commonT('howCanWeHelp')}
        icon={MessageSquare}
        register={register}
        rules={{
          required: commonT('messageRequired'),
          minLength: {
            value: 10,
            message: commonT('messageMinLength') || 'Message should be at least 10 characters'
          }
        }}
        error={errors.message}
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