const NotificationCard = ({
  title,
  message,
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-5">

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="text-gray-600 mt-2">
        {message}
      </p>

    </div>
  );
};

export default NotificationCard;