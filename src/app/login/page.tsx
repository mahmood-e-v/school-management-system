import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter text-gray-900">
                        School Management System
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Secure access for teachers and administrators
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
