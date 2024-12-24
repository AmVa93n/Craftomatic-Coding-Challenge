export default function useFormat() {

    // Convert a time string to HH:MM format
    function formatTime(timeString: string) {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Convert a date string to DD MMM format
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    return { formatTime, formatDate };
}