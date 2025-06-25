

export const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '40px',
        backgroundColor: 'var(--background)',
        borderColor: state.isFocused ? 'var(--primary-border)' : 'var(--border)',
        boxShadow: state.isFocused ? '0 0 0 1px var(--primary-border)' : null,
        '&:hover': {
            borderColor: 'var(--border)'
        },
        fontSize: '14px'
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
            ? 'var(--special-light)' 
            : state.isFocused 
                ? 'var(--card)' 
                : 'var(--background)',
        color: 'var(--foreground)',
        fontSize: '14px',
        borderBottom: '1px solid var(--border)', // Add subtle separator
        '&:last-child': {
            borderBottom: 'none' // Remove separator for the last option
        },
        '&:active': {
            backgroundColor: 'var(--card)'
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        zIndex: 9999,
        marginTop: '4px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }),
    menuPortal: base => ({
        ...base,
        zIndex: 9999
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'var(--foreground)',
        fontSize: '14px'
    }),
    input: (provided) => ({
        ...provided,
        color: 'var(--foreground)',
        fontSize: '14px'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'var(--foreground-muted)',
        fontSize: '14px'
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: 'var(--border)'
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: 'var(--foreground)',
        padding: '8px',
        '&:hover': {
            color: 'var(--foreground)'
        },
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
        transition: 'transform 0.2s ease'
    }),
    container: (provided) => ({
        ...provided,
        width: '100%'
    })
};


export const getThreeConsecutivePages = (currentPage, totalPages) => {
    let pages = [];
    
    if (totalPages <= 3) {
      // Si hay 3 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para 3 páginas consecutivas
      if (currentPage === 1) {
        pages = [1, 2, 3];
      } else if (currentPage === totalPages) {
        pages = [totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [currentPage - 1, currentPage, currentPage + 1];
      }
    }
    
    return pages;
  };