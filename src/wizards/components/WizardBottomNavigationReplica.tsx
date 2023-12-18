interface WizardBottomNavigationReplicaProps {
  children: React.ReactNode;
}

/**
 * Replicates the Wizard bottom navigation area.
 * Useful if an intro step needs to display an alternative
 * version of the Wizard stepper (which is hidden for intro step).
 */
export const WizardBottomNavigationReplica = ({
  children,
}: WizardBottomNavigationReplicaProps) => {
  return (
    <div className="flex absolute bottom-0 justify-end items-center p-2 w-full h-14 text-lg font-bold bg-white lg:rounded-b-lg border-t shadow-2xl">
      {children}
    </div>
  );
};
