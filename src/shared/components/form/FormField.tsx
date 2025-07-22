import React from 'react';
import { Input, InputField } from '@/shared/components/ui/input';
import { Text } from '@/shared/components/ui/text';
import { VStack } from '@/shared/components/ui/vstack';
import { Textarea, TextareaInput } from '@/shared/components/ui/textarea';
import { HStack } from '../ui/hstack';

interface BaseFormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

interface TextFormFieldProps extends BaseFormFieldProps {
  type: 'text' | 'email' | 'number';
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  multiline?: false;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: 'textarea';
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  numberOfLines?: number;
  multiline: true;
}

type FormFieldProps = TextFormFieldProps | TextareaFormFieldProps;

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  disabled = false,
  className,
  onBlur,
  onFocus,
  ...props
}) => {
  const getBorderColor = () => {
    if (error) return 'border-red-500';
    return 'border-gray-200';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-100';
    return 'bg-gray-50';
  };

  const getFocusStyles = () => {
    if (disabled) return '';
    return 'focus:border-blue-500 focus:bg-white';
  };

  const renderInput = () => {
    if (props.type === 'textarea') {
      return (
        <Textarea
          className={`rounded-xl border-2 px-2 py-2 ${getBorderColor()} ${getBackgroundColor()} ${getFocusStyles()} transition-all ${className}`}
          isDisabled={disabled}
        >
          <TextareaInput
            value={props.value}
            onChangeText={props.onChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={props.placeholder}
            multiline={true}
            numberOfLines={props.numberOfLines || 4}
            textAlignVertical="top"
            className="text-base font-medium"
            editable={!disabled}
          />
        </Textarea>
      );
    }

    return (
      <Input
        className={`rounded-xl border-2 px-2 py-2 ${getBorderColor()} ${getBackgroundColor()} ${getFocusStyles()} transition-all ${className}`}
        size="lg"
        isDisabled={disabled}
      >
        <InputField
          value={props.value}
          onChangeText={props.onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType || 'default'}
          autoCapitalize={props.autoCapitalize || 'sentences'}
          autoCorrect={props.autoCorrect !== false}
          maxLength={props.maxLength}
          returnKeyType={props.returnKeyType}
          className="text-base font-medium"
          editable={!disabled}
        />
      </Input>
    );
  };

  return (
    <VStack space="sm" className="mb-4">
      {label && (
        <HStack space="xs" className="items-center">
          <Text className="text-sm font-semibold text-gray-700">{label}</Text>
          {required && <Text className="text-red-500 ml-0.5">*</Text>}
        </HStack>
      )}

      {renderInput()}

      {(error || helperText) && (
        <VStack space="xs">
          {error && <Text className="text-sm text-red-500">{error}</Text>}
          {helperText && !error && (
            <Text className="text-sm text-gray-500">{helperText}</Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};
