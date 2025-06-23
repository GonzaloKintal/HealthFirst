
// // // Estilos personalizados para el componente Select de React Select
// // export const customStyles = {
// //     control: (provided, state) => ({
// //         ...provided,
// //         minHeight: '40px',
// //         backgroundColor: 'var(--background)',
// //         borderColor: 'var(--border)',
// //         boxShadow: state.isFocused ? '0 0 0 2px var(--primary-border)' : null,
// //         '&:hover': {
// //         borderColor: 'var(--border)'
// //         }
// //     }),
// //     option: (provided, state) => ({
// //         ...provided,
// //         backgroundColor: state.isSelected 
// //         ? 'var(--special-light)' 
// //         : state.isFocused 
// //             ? 'var(--card)' 
// //             : 'var(--background)',
// //         color: 'var(--foreground)',
// //         '&:active': {
// //         backgroundColor: 'var(--card)'
// //         }
// //     }),
// //     menu: (provided) => ({
// //         ...provided,
// //         backgroundColor: 'var(--background)',
// //         border: '1px solid var(--border)',
// //         zIndex: 20
// //     }),
// //     singleValue: (provided) => ({
// //         ...provided,
// //         color: 'var(--foreground)'
// //     }),
// //     input: (provided) => ({
// //         ...provided,
// //         color: 'var(--foreground)'
// //     }),
// //     indicatorSeparator: (provided) => ({
// //         ...provided,
// //         backgroundColor: 'var(--border)'
// //     }),
// //     dropdownIndicator: (provided) => ({
// //         ...provided,
// //         color: 'var(--foreground)',
// //         '&:hover': {
// //         color: 'var(--foreground)'
// //         }
// //     })
// // };

// export const customStyles = {
//     control: (provided, state) => ({
//         ...provided,
//         minHeight: '40px',
//         backgroundColor: 'var(--background)',
//         borderColor: state.isFocused ? 'var(--primary-border)' : 'var(--border)',
//         boxShadow: state.isFocused ? '0 0 0 1px var(--primary-border)' : null,
//         '&:hover': {
//             borderColor: 'var(--border)'
//         },
//         fontSize: '14px' // Tamaño consistente
//     }),
//     option: (provided, state) => ({
//         ...provided,
//         backgroundColor: state.isSelected 
//             ? 'var(--special-light)' 
//             : state.isFocused 
//                 ? 'var(--card)' 
//                 : 'var(--background)',
//         color: 'var(--foreground)',
//         fontSize: '14px',
//         '&:active': {
//             backgroundColor: 'var(--card)'
//         }
//     }),
//     menu: (provided) => ({
//         ...provided,
//         backgroundColor: 'var(--background)',
//         border: '1px solid var(--border)',
//         zIndex: 9999, // Asegura que esté por encima
//         marginTop: '4px',
//         borderRadius: '6px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//     }),
//     menuPortal: base => ({
//         ...base,
//         zIndex: 9999 // Para el portal en caso de usarlo
//     }),
//     singleValue: (provided) => ({
//         ...provided,
//         color: 'var(--foreground)',
//         fontSize: '14px'
//     }),
//     input: (provided) => ({
//         ...provided,
//         color: 'var(--foreground)',
//         fontSize: '14px'
//     }),
//     placeholder: (provided) => ({
//         ...provided,
//         color: 'var(--foreground-muted)',
//         fontSize: '14px'
//     }),
//     indicatorSeparator: (provided) => ({
//         ...provided,
//         backgroundColor: 'var(--border)'
//     }),
//     dropdownIndicator: (provided, state) => ({
//         ...provided,
//         color: 'var(--foreground)',
//         padding: '8px',
//         '&:hover': {
//             color: 'var(--foreground)'
//         },
//         transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
//         transition: 'transform 0.2s ease'
//     }),
//     container: (provided) => ({
//         ...provided,
//         width: '100%'
//     })
// };


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