import React from 'react';
import styled from 'styled-components';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Если страниц меньше 2, не показываем пагинацию
    if (totalPages < 2) {
        return null;
    }

    // Генерируем массив страниц для отображения
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7; // Максимальное количество видимых страниц
        
        if (totalPages <= maxVisiblePages) {
            // Если общее количество страниц меньше максимального, показываем все
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Иначе показываем умную пагинацию
            if (currentPage <= 4) {
                // В начале списка
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // В конце списка
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // В середине списка
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <PaginationContainer>
            {/* Кнопка "Предыдущая" */}
            {currentPage > 1 && (
                <PageButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={false}
                >
                    ← Предыдущая
                </PageButton>
            )}

            {/* Номера страниц */}
            <PageNumbers>
                {pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <Ellipsis>...</Ellipsis>
                        ) : (
                            <PageButton
                                onClick={() => onPageChange(page)}
                                isActive={page === currentPage}
                                disabled={false}
                            >
                                {page}
                            </PageButton>
                        )}
                    </React.Fragment>
                ))}
            </PageNumbers>

            {/* Кнопка "Следующая" */}
            {currentPage < totalPages && (
                <PageButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={false}
                >
                    Следующая →
                </PageButton>
            )}
        </PaginationContainer>
    );
};

// Styled Components
const PaginationContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const PageNumbers = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const PageButton = styled.button`
    background: ${props => props.isActive ? '#3498db' : 'white'};
    color: ${props => props.isActive ? 'white' : '#2c3e50'};
    border: 2px solid ${props => props.isActive ? '#3498db' : '#e1e8ed'};
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 40px;
    text-align: center;

    &:hover:not(:disabled) {
        background: ${props => props.isActive ? '#2980b9' : '#f8f9fa'};
        border-color: ${props => props.isActive ? '#2980b9' : '#3498db'};
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        padding: 6px 10px;
        font-size: 0.8rem;
        min-width: 36px;
    }
`;

const Ellipsis = styled.span`
    color: #7f8c8d;
    font-weight: 500;
    padding: 8px 4px;
    user-select: none;

    @media (max-width: 768px) {
        padding: 6px 2px;
    }
`;

export default Pagination;
