import React from 'react';
import {
  Star as StarFilled,
  StarBorder as StarEmpty,
  StarHalf as StarHalfIcon
} from '@mui/icons-material';

const StarRating = ({ rating, onRatingChange, interactive = false, size = 'normal' }) => {
  const maxStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const iconSize = {
    small: 'text-base',
    normal: 'text-xl',
    large: 'text-3xl'
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const filled = starValue <= fullStars;
    const isHalf = starValue === fullStars + 1 && hasHalfStar;

    const commonProps = {
      className: `cursor-pointer ${iconSize[size]} transition-transform duration-150 ${
        interactive ? 'hover:scale-125 text-yellow-500' : 'text-yellow-400'
      }`,
      onClick: () => handleStarClick(starValue),
      role: interactive ? 'button' : 'img',
      'aria-label': `${starValue} star${starValue !== 1 ? 's' : ''}`,
      tabIndex: interactive ? 0 : -1,
      onKeyDown: (e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleStarClick(starValue);
        }
      }
    };

    if (filled) return <StarFilled key={index} {...commonProps} />;
    if (isHalf) return <StarHalfIcon key={index} {...commonProps} />;
    return <StarEmpty key={index} {...commonProps} />;
  };

  return (
    <div className="flex gap-1 items-center">
      {[...Array(maxStars)].map((_, index) => renderStar(index))}
    </div>
  );
};

export default StarRating;
