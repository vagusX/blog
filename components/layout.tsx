import Footer from './footer';
import GTag from './gtag';
import Meta from './meta';

import { GA_MEASUREMENT_ID } from '../lib/constants';

type Props = {
  preview?: boolean;
  children: React.ReactNode;
};

const Layout = ({ preview, children }: Props) => {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <main>{children}</main>
      </div>
      <Footer />
      <GTag id={GA_MEASUREMENT_ID} />
    </>
  );
};

export default Layout;
