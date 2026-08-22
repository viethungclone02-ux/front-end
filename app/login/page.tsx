'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Login() {
    const [view, setView] = useState<'login' | 'change-password'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Khởi tạo state cho Đổi Mật Khẩu
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showLoginPass, setShowLoginPass] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Xóa thông báo lỗi/thành công khi đổi view
    useEffect(() => {
        setError('');
        setSuccessMsg('');
    }, [view]);

    // Xử lý đăng nhập
    const handleSubmitLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!email.includes('@')) {
            setError('Email không hợp lệ. Vui lòng nhập lại.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            
            const savedEmail = localStorage.getItem('user_email') || 'hung@gmail.com';
            const savedPassword = localStorage.getItem('user_password') || '123456';

            if (email !== savedEmail || password !== savedPassword) {
                setError('Email hoặc mật khẩu không chính xác.');
                return;
            }

            alert(`Đăng nhập thành công với Email: ${email}`);
        }, 1000);
    };

    // Xử lý đổi mật khẩu
    const handleSubmitChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const savedEmail = localStorage.getItem('user_email') || 'hung@gmail.com';
        const savedPassword = localStorage.getItem('user_password') || '123456';

        // 1. Kiểm tra khớp email của user hiện tại
        if (email !== savedEmail) {
            setError('Email này không tồn tại trong hệ thống.');
            return;
        }

        // 2. Kiểm tra mật khẩu hiện tại
        if (changePasswordData.currentPassword !== savedPassword) {
            setError('Mật khẩu hiện tại không chính xác.');
            return;
        }

        // 3. Kiểm tra độ dài mật khẩu mới
        if (changePasswordData.newPassword.length < 6) {
            setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
            return;
        }

        // 4. Kiểm tra mật khẩu mới khác mật khẩu cũ
        if (changePasswordData.newPassword === changePasswordData.currentPassword) {
            setError('Mật khẩu mới không được trùng mật khẩu cũ.');
            return;
        }

        // 5. Kiểm tra xác nhận mật khẩu mới
        if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
            setError('Xác nhận mật khẩu mới không trùng khớp.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            localStorage.setItem('user_password', changePasswordData.newPassword);
            setSuccessMsg('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
            setView('login');
            setPassword(''); // Xóa mật khẩu cũ ở form đăng nhập
            setChangePasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        }, 1200);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
                
                {view === 'login' ? (
                    <>
                        {/* Tiêu đề Đăng Nhập */}
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900">Đăng Nhập</h2>
                            <p className="text-sm text-gray-500">Vui lòng nhập thông tin tài khoản của bạn</p>
                        </div>

                        {/* Thông báo */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                                {successMsg}
                            </div>
                        )}

                        {/* Form đăng nhập */}
                        <form onSubmit={handleSubmitLogin} className="space-y-4">
                            {/* Nhập Email */}
                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Email:
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="nhap-email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                />
                            </div>

                            {/* Nhập Mật khẩu */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Mật khẩu:
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setView('change-password')}
                                        className="text-xs text-blue-600 hover:underline font-medium"
                                    >
                                        Đổi mật khẩu?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showLoginPass ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPass(!showLoginPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showLoginPass ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Nút đăng nhập */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Tiêu đề Đổi Mật Khẩu */}
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
                            <p className="text-sm text-gray-500">Cập nhật mật khẩu mới cho tài khoản của bạn</p>
                        </div>

                        {/* Thông báo lỗi */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Form đổi mật khẩu */}
                        <form onSubmit={handleSubmitChangePassword} className="space-y-4">
                            {/* Nhập Email xác nhận */}
                            <div className="space-y-1">
                                <label htmlFor="confirmEmail" className="block text-sm font-semibold text-gray-700">
                                    Email xác thực tài khoản:
                                </label>
                                <input
                                    id="confirmEmail"
                                    type="email"
                                    required
                                    placeholder="nhap-email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                />
                            </div>

                            {/* Mật khẩu hiện tại */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Mật khẩu hiện tại:
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        required
                                        value={changePasswordData.currentPassword}
                                        onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                        disabled={isLoading}
                                        placeholder="••••••••"
                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showCurrent ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Mật khẩu mới */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Mật khẩu mới:
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        required
                                        value={changePasswordData.newPassword}
                                        onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                        disabled={isLoading}
                                        placeholder="••••••••"
                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showNew ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Xác nhận mật khẩu mới */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Xác nhận mật khẩu mới:
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={changePasswordData.confirmNewPassword}
                                        onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmNewPassword: e.target.value })}
                                        disabled={isLoading}
                                        placeholder="••••••••"
                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirm ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Nút cập nhật và Hủy */}
                            <div className="space-y-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50"
                                >
                                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('login')}
                                    disabled={isLoading}
                                    className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-lg transition duration-150 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Link chuyển sang đăng ký */}
                <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100 pt-4">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </main>
    );
}