import React from 'react';
import { Property } from '../types';
import { OnboardingTunnel } from './OnboardingTunnel';

interface AddPropertyModalProps {
  onClose: () => void;
  onAddProperty: (property: Property) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  onClose,
  onAddProperty
}) => {
  return <OnboardingTunnel onClose={onClose} onComplete={onAddProperty} />;
};
