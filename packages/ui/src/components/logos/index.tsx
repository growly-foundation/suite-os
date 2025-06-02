import suiteIconAsset from '../../assets/logos/suite-icon.png';
import suiteLogoFullAsset from '../../assets/logos/suite-logo-full.png';
import suiteLogoAsset from '../../assets/logos/suite-logo.png';
import suiteUserAsset from '../../assets/logos/suite-user.png';

export const SuiteLogo = ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={suiteLogoAsset} alt="Suite Logo" {...props} />;
};

export const SuiteLogoFull = ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={suiteLogoFullAsset} alt="Suite Logo Full" {...props} />;
};

export const SuiteUser = ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={suiteUserAsset} alt="Suite User" {...props} />;
};

export const SuiteIcon = ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={suiteIconAsset} alt="Suite Icon" {...props} />;
};
