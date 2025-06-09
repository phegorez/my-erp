import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label'; // Assuming Label is used as in the actual component

// Definition of ProfileInfoItem copied from app/profile/page.tsx for testing
// Ideally, this component would be in its own file and imported.
const ProfileInfoItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    <p className="text-md text-foreground">{value || <span className="italic text-gray-400">N/A</span>}</p>
  </div>
);


describe('ProfileInfoItem Component', () => {
  test('renders label and value correctly when value is provided', () => {
    const labelText = 'Test Label';
    const valueText = 'Test Value';
    render(<ProfileInfoItem label={labelText} value={valueText} />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
    expect(screen.getByText(valueText)).toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  test('renders "N/A" when value is null', () => {
    const labelText = 'Test Label Null';
    render(<ProfileInfoItem label={labelText} value={null} />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('renders "N/A" when value is undefined', () => {
    const labelText = 'Test Label Undefined';
    render(<ProfileInfoItem label={labelText} value={undefined} />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('renders "N/A" when value is an empty string', () => {
    // Depending on desired behavior, an empty string might be treated as "N/A" or rendered as empty.
    // The current implementation `value || <span className="italic text-gray-400">N/A</span>` treats empty string as falsy, rendering N/A.
    const labelText = 'Test Label Empty String';
    render(<ProfileInfoItem label={labelText} value="" />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('applies correct classes for styling (spot check)', () => {
    // This is a more fragile test, but can be useful for critical styling.
    const labelText = 'Style Check Label';
    const valueText = 'Style Check Value';
    render(<ProfileInfoItem label={labelText} value={valueText} />);

    const labelElement = screen.getByText(labelText);
    const valueElement = screen.getByText(valueText);

    // Check classes on Label (assuming Label component applies its className prop)
    // Note: Actual class might be different if Label component internally transforms it.
    // This test is more about the structure and props passed to Label.
    expect(labelElement).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');

    // Check classes on the <p> tag holding the value
    expect(valueElement).toHaveClass('text-md', 'text-foreground');
  });
});
