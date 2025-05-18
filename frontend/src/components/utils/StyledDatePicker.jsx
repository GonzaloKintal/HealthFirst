import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StyledDatePicker = ({ className = '', ...props }) => {
  return (
    <div className="react-datepicker-wrapper w-full">
      <DatePicker
        className={`
          w-full px-3 py-2 
          border border-border rounded-md 
          focus:ring-none focus:ring-primary-border 
          focus:border-primary-border 
          bg-background text-foreground 
          focus:outline-none focus:ring-offset-0
          hover:border-gray-300
          transition-colors
          ${className}
        `}
        wrapperClassName="w-full focus:outline-none"
        popperClassName="react-datepicker-popper z-50"
        calendarClassName="border border-border rounded-md shadow-lg focus:outline-none"
        dayClassName={(date) => 
          'hover:bg-gray-100 rounded transition-colors focus:outline-none'
        }
        {...props}
      />
    </div>
  );
};

export default StyledDatePicker;