import React, { useState } from 'react';
import styled from 'styled-components';

const ReviewList = ({ 
    reviews = [], 
    movie,
    onAddReview,
    onEditReview,
    onDeleteReview 
}) => {
    const [expandedReview, setExpandedReview] = useState(null);

    const toggleReviewExpansion = (reviewId) => {
        setExpandedReview(expandedReview === reviewId ? null : reviewId);
    };

    const getReviewerDisplayName = (reviewerName) => {
        return reviewerName === 'Цеха' ? 'Цеха (Я)' : reviewerName === 'Паша' ? 'Паша (Друг)' : reviewerName;
    };

    const getReviewerColor = (reviewerName) => {
        return reviewerName === 'Цеха' ? '#667eea' : reviewerName === 'Паша' ? '#ff6b6b' : '#999';
    };



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (reviews.length === 0) {
        return (
            <EmptyState>
                <EmptyIcon>📝</EmptyIcon>
                <EmptyTitle>Рецензий пока нет</EmptyTitle>
                <EmptyText>
                    Будьте первым, кто оставит рецензию на этот фильм!
                </EmptyText>
                <AddReviewButton onClick={onAddReview}>
                    ✍️ Добавить рецензию
                </AddReviewButton>
            </EmptyState>
        );
    }

    return (
        <Container>
            <Header>
                <Title>Рецензии ({reviews.length})</Title>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {!reviews.some(review => review.reviewer_name === 'Паша') && (
                        <AddReviewButton 
                            onClick={() => onAddReview('Паша')}
                            style={{ background: '#ff6b6b', borderColor: '#ff6b6b' }}
                        >
                            ✍️ Добавить рецензию от Паши
                        </AddReviewButton>
                    )}
                </div>
            </Header>

            <ReviewsContainer>
                {reviews.map((review) => (
                    <ReviewCard key={review.id}>
                        <ReviewHeader>
                            <ReviewerInfo>
                                <ReviewerAvatar color={getReviewerColor(review.reviewer_name)}>
                                    {getReviewerDisplayName(review.reviewer_name).charAt(0)}
                                </ReviewerAvatar>
                                <ReviewerDetails>
                                    <ReviewerName color={getReviewerColor(review.reviewer_name)}>
                                        {getReviewerDisplayName(review.reviewer_name)}
                                    </ReviewerName>
                                    <ReviewDate>{formatDate(review.review_date)}</ReviewDate>
                                </ReviewerDetails>
                            </ReviewerInfo>
                            
                            <ReviewActions>
                                <RatingDisplay>
                                    <RatingStars rating={review.rating} />
                                    <RatingValue>{review.rating}/10</RatingValue>
                                </RatingDisplay>
                                
                                <ActionButtons>
                                    <EditButton 
                                        onClick={() => onEditReview(review)}
                                        title="Редактировать"
                                    >
                                        ✏️
                                    </EditButton>
                                    <DeleteButton 
                                        onClick={() => onDeleteReview(review.id)}
                                        title="Удалить"
                                    >
                                        🗑️
                                    </DeleteButton>
                                </ActionButtons>
                            </ReviewActions>
                        </ReviewHeader>

                        <ReviewContent>
                            <ReviewText 
                                expanded={expandedReview === review.id}
                                onClick={() => toggleReviewExpansion(review.id)}
                            >
                                {review.review_text}
                            </ReviewText>
                            
                            {review.review_text.length > 200 && (
                                <ExpandButton 
                                    onClick={() => toggleReviewExpansion(review.id)}
                                >
                                    {expandedReview === review.id ? 'Свернуть' : 'Читать далее'}
                                </ExpandButton>
                            )}
                        </ReviewContent>
                    </ReviewCard>
                ))}
            </ReviewsContainer>
        </Container>
    );
};

// Компонент для отображения звездочек рейтинга
const RatingStars = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
        stars.push(
            <Star key={i} filled={i <= rating}>
                {i <= rating ? '★' : '☆'}
            </Star>
        );
    }
    return <StarsContainer>{stars}</StarsContainer>;
};

// Styled Components
const Container = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: #f8f9fa;
    color: #333;
    border-bottom: 2px solid #e9ecef;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
`;

const AddReviewButton = styled.button`
    background: #667eea;
    color: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #5a6fd8;
        border-color: #5a6fd8;
        transform: translateY(-1px);
    }
`;

const ReviewsContainer = styled.div`
    padding: 24px;
`;

const ReviewCard = styled.div`
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    background: #f8f9fa;
    transition: all 0.2s ease;

    &:last-child {
        margin-bottom: 0;
    }

    &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
`;

const ReviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const ReviewerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ReviewerAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
`;

const ReviewerDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ReviewerName = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.color};
`;

const ReviewDate = styled.span`
    font-size: 14px;
    color: #666;
`;

const ReviewActions = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const RatingDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StarsContainer = styled.div`
    display: flex;
    gap: 1px;
`;

const Star = styled.span`
    color: ${props => props.filled ? '#ffd700' : '#ddd'};
    font-size: 14px;
`;

const RatingValue = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #333;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
    }
`;

const EditButton = styled(ActionButton)`
    color: #667eea;
`;

const DeleteButton = styled(ActionButton)`
    color: #ff4757;
`;

const ReviewContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ReviewText = styled.p`
    margin: 0;
    line-height: 1.6;
    color: #333;
    cursor: ${props => props.expanded ? 'default' : 'pointer'};
    
    ${props => !props.expanded && `
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    `}
`;

const ExpandButton = styled.button`
    background: none;
    border: none;
    color: #667eea;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 0;
    text-decoration: underline;
    transition: color 0.2s ease;

    &:hover {
        color: #5a6fd8;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #666;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
`;

const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
    font-size: 1.5rem;
    margin: 0 0 12px 0;
    color: #333;
`;

const EmptyText = styled.p`
    font-size: 1.1rem;
    margin: 0 0 24px 0;
    color: #888;
`;

export default ReviewList;
