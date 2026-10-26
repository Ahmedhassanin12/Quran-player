import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useOnlineStatus from '../hooks/useOnlineStatus';

/**
 * When the device is offline, keep the user on /downloads so they can
 * pick from the local library instead of API-backed pages.
 */
const OfflineGate = () => {
  const isOnline = useOnlineStatus();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnline) return;
    if (location.pathname === '/downloads') return;
    navigate('/downloads', { replace: true });
  }, [isOnline, location.pathname, navigate]);

  return null;
};

export default OfflineGate;
