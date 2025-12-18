import { useState } from 'react';
import '../styles/support.css';

const faqs = [
    {
        question: 'How long does delivery take?',
        answer: 'Orders in Ho Chi Minh City are delivered within 24-48 hours. Other provinces typically take 2-4 working days.',
    },
    {
        question: 'Can I try products at the store?',
        answer: 'Yes. Book an appointment with TNH Studio to experience Mac, iPhone and accessories with a specialist.',
    },
    {
        question: 'What is the return policy?',
        answer: 'Electronics can be exchanged within 14 days for manufacturing defects with the original receipt and packaging.',
    },
];

const SupportPage = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = event => {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = event => {
        event.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
        setForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="support-page">
            <header className="support-hero">
                <div>
                    <h1>Support center</h1>
                    <p>We are here to help with product setup, order issues, and AppleCare+ services.</p>
                </div>
                <div className="support-cta">
                    <strong>Hotline</strong>
                    <span>1900-111-222</span>
                    <p>Available 8:00 - 22:00, every day.</p>
                </div>
            </header>

            <div className="support-grid">
                <form className="support-form" onSubmit={handleSubmit}>
                    <h2>Send us a message</h2>
                    <label>
                        <span>Full name</span>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>How can we help?</span>
                        <textarea
                            name="message"
                            rows={5}
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Describe your question"
                            required
                        />
                    </label>
                    <button type="submit" className="support-submit">
                        {submitted ? 'Message sent!' : 'Send message'}
                    </button>
                </form>

                <aside className="support-info">
                    <div className="support-card">
                        <h2>Frequently asked questions</h2>
                        <ul>
                            {faqs.map(faq => (
                                <li key={faq.question}>
                                    <strong>{faq.question}</strong>
                                    <p>{faq.answer}</p>
                                </li>
                            ))}
                        </ul>
                    </div>


                </aside>
            </div>
        </div>
    );
};

export default SupportPage;