import { getSiteConfig, useAppConfig } from '@openedx/frontend-base';
import { Hyperlink, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';

/**
 * The site logo, linked to the marketing site when the operator has configured one.
 *
 * `MARKETING_SITE_BASE_URL` has no default that could work for every site, so when it is
 * unset the logo renders on its own rather than as a link to nowhere.
 */
const BrandLogo = ({ className, variant }) => {
  const { LOGO_URL, LOGO_WHITE_URL, MARKETING_SITE_BASE_URL } = useAppConfig();
  const image = (
    <Image
      className={className}
      alt={getSiteConfig().siteName}
      src={variant === 'white' ? LOGO_WHITE_URL : LOGO_URL}
    />
  );

  if (!MARKETING_SITE_BASE_URL) {
    return image;
  }

  return (
    <Hyperlink destination={MARKETING_SITE_BASE_URL}>
      {image}
    </Hyperlink>
  );
};

BrandLogo.defaultProps = {
  className: null,
  variant: 'white',
};

BrandLogo.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['white', 'default']),
};

export default BrandLogo;
