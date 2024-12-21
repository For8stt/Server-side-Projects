import React,{useState} from "react";

const SignIn=({ setMessage , setId, setAdmin})=>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [name,setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const loginData={
            name,
            password,
            email
        }

        fetch('http://localhost:8080/login',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        }).then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(errorData.message || 'Unknown error occurred');
                });
            }
            return response.json();
        }).then((data) => {
            console.log('Successful entry:', data);
            setMessage(''+data.message +':  '+ data.user.name);
            setId(data.user.id);
            setAdmin(data.user.isAdmin)


            }).catch((error) => {
                console.error('Error while logging in:', error);
                setMessage(error.message)
            });
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login form (for admin any email*)</h2>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Sign-in</button>
        </form>
    );
}
export default SignIn;