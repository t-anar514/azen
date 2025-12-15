import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';

import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  subject: string;
  email: string;
  name: string;
  message: string;
  budget?: string;
  projectType?: string;
};

export default function AzenContactForm() {
  const theme = useTheme();

  const ContactSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
    email: Yup.string().required('Email is required').email('That is not an email'),
    name: Yup.string().required('Name is required'),
    message: Yup.string().required('Message is required'),
    budget: Yup.string(),
    projectType: Yup.string(),
  });

  const defaultValues = {
    subject: 'General Inquiry',
    email: '',
    name: '',
    message: '',
    budget: '',
    projectType: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ContactSchema) as any,
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const isQuote = values.subject === 'I need a quote';

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.info('DATA', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: theme.customShadows.z24,
      }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
           <RHFSelect name="subject" label="Subject">
             <MenuItem value="General Inquiry">General Inquiry</MenuItem>
             <MenuItem value="I need a quote">I need a quote</MenuItem>
           </RHFSelect>

           <RHFTextField name="name" label="Name" />
           <RHFTextField name="email" label="Email" />

           {isQuote && (
             <>
               <RHFSelect name="projectType" label="Project Type">
                 <MenuItem value="Strategy (Phase A)">Strategy (Phase A)</MenuItem>
                 <MenuItem value="Execution (Phase M)">Execution (Phase M)</MenuItem>
                 <MenuItem value="Maintenance (Phase Z)">Maintenance (Phase Z)</MenuItem>
                 <MenuItem value="Full A-Z">Full A-Z</MenuItem>
               </RHFSelect>

               <RHFSelect name="budget" label="Budget">
                 <MenuItem value="< $10k">&lt; $10k</MenuItem>
                 <MenuItem value="$10k - $50k">$10k - $50k</MenuItem>
                 <MenuItem value="$50k+">$50k+</MenuItem>
               </RHFSelect>
             </>
           )}

           <RHFTextField name="message" label="Message" multiline rows={4} />

           <LoadingButton
             size="large"
             type="submit"
             variant="contained"
             loading={isSubmitting}
           >
             Send Request
           </LoadingButton>
        </Stack>
      </FormProvider>
    </Box>
  );
}
