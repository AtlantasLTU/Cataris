import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';


interface RegisterProps {
    onClose?: () => void;

}


const Register: React.FC<RegisterProps> = ({ onClose }) => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const validatePassword = (password: string): boolean => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,40}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!validatePassword(password)) {
            setError("Password does not corresponds to the requirements");
            return;
        }
        try {
            await register(username, email, password, confirmPassword);
            console.log("User registered");
            if (onClose) {
                onClose();
            }
            void navigate('/');
            window.location.reload();
            /*
        const result = await login({username, password});
        if(result && 'token' in result)
        {
            localStorage.setItem('token', result.token);
        }
        navigate('/');
        */
        }
        catch (error: any) {
            setError(error.message || "Registration failed. Please try again");
        }
    }
    return (
        <div className='flex justify-center items-center h-screen bg-gray 100'>
            <form onSubmit={handleSubmit} className='bg-white text-black p-6 shadow-lg rounded-lg w-96'>
                <h2 className="text-2x1 font-bold mb-4 text-center">Register</h2>
                {error && <p className='text-red-500 text-center'>{error}</p>}
                <div className='mb-4'>
                    <input
                        type='text'
                        placeholder='Name'
                        className='w-full p-2 border border-gray-300 rounded'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required />
                </div>
                <div className='mb-4'>
                    <input
                        type='email'
                        placeholder='Email'
                        className='w-full p-2 border border-gray-300 rounded'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                </div>
                <div className='mb-4 relative'>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Password'
                        className='w-full p-2 border border-gray-300 rounded'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className='mb-4 relative'>
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm Password'
                        className='w-full p-2 border border-gray-300 rounded'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                    <p>Password requirements:</p>
                    <ul>
                        <li>    ● 4-40 characters</li>
                        <li>    ● At least one uppercase letter (A-Z)</li>
                        <li>    ● At least one lowercase letter (a-z)</li>
                        <li>    ● At least one number (0-9)</li>
                        <li>    ● At least one special character (e.g., !, @, #, $, %, etc.)</li>
                    </ul>
                </div>
                <button type='submit' className='w-full bg-blue-500 text0white py-2 rounded'>Register</button>

            </form>

        </div>
    )
}

export default Register