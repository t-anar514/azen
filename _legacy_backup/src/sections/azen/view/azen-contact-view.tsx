import { Helmet } from 'react-helmet-async';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import AzenContactInfo from '../contact/azen-contact-info';
import AzenContactForm from '../contact/azen-contact-form';

// ----------------------------------------------------------------------

export default function AzenContactView() {
  return (
    <>
      <Helmet>
        <title> Azen | Contact Us </title>
      </Helmet>

      <Container sx={{ py: { xs: 10, md: 15 } }}>
        <Grid container spacing={8} justifyContent="space-between">
            <Grid xs={12} md={5}>
                <AzenContactInfo />
            </Grid>

            <Grid xs={12} md={6}>
                <AzenContactForm />
            </Grid>
        </Grid>
      </Container>
    </>
  );
}
