export default function ApplicationLogo({ theme = 'light', ...props }) {
    // Light theme: Indigo colors
    // Dark theme: White colors
    const fill = theme === 'dark' ? '#ffffff' : '#4f46e5';

    return (
        <svg
            {...props}
            viewBox="0 0 640 512"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            className={`transition-all duration-300 ${props.className || ''}`}
        >
            {/* Background */}
            <rect width="640" height="512" fill="none" />
            
            {/* Building illustration */}
            <g transform="translate(80,40)" fill={fill}>
                {/* Top floor - Purple/Indigo */}
                <rect x="0" y="0" width="480" height="120" rx="12" fill={theme === 'dark' ? '#7c3aed' : '#4f46e5'} opacity="0.9" />
                
                {/* Middle left floor - Blue */}
                <rect x="0" y="140" width="220" height="120" rx="8" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} opacity="0.9" />
                
                {/* Middle right floor - Green */}
                <rect x="260" y="140" width="220" height="120" rx="8" fill={theme === 'dark' ? '#34d399' : '#10b981'} opacity="0.9" />
                
                {/* Bottom floor - Orange */}
                <rect x="0" y="280" width="480" height="120" rx="8" fill={theme === 'dark' ? '#f97316' : '#f59e0b'} opacity="0.9" />
                
                {/* Window/Light element */}
                <g transform="translate(20,20)" fill={fill} opacity="0.15">
                    <circle cx="220" cy="60" r="28" fill={theme === 'dark' ? '#ffffff' : '#4f46e5'} opacity="0.15" />
                </g>
            </g>
        </svg>
    );
}
