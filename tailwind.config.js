var config = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#FFF2F2',
                    100: '#FFE5E7',
                    200: '#FFCAD0',
                    300: '#FF9AA7',
                    400: '#FF667B',
                    500: '#F43F5E',
                    600: '#E11D48',
                    700: '#BE123C',
                    800: '#9F1239',
                    900: '#881337'
                },
                zincx: {
                    950: '#09090B'
                }
            },
            boxShadow: {
                soft: '0 10px 25px -10px rgba(0, 0, 0, 0.15)',
                glow: '0 0 0 1px rgba(244, 63, 94, 0.25), 0 12px 30px -12px rgba(244, 63, 94, 0.55)'
            },
            backgroundImage: {
                'mesh-light': 'radial-gradient(circle at 15% 20%, rgba(244,63,94,0.15), transparent 35%), radial-gradient(circle at 85% 15%, rgba(190,24,93,0.12), transparent 35%)',
                'mesh-dark': 'radial-gradient(circle at 15% 20%, rgba(244,63,94,0.2), transparent 35%), radial-gradient(circle at 85% 15%, rgba(190,24,93,0.2), transparent 35%)'
            }
        }
    },
    plugins: []
};
export default config;
