'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import Box from '@mui/material/Box';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function Editor({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Box sx={{ 
      '& .quill': { height: '100%', display: 'flex', flexDirection: 'column' },
      '& .ql-container': { flex: 1, overflow: 'hidden', minHeight: '200px' },
      '& .ql-editor': { minHeight: '200px', fontSize: '1rem', direction: 'rtl', textAlign: 'right' }
    }}>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
      />
    </Box>
  );
}

