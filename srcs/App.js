import React, { useEffect, useState } from "react";
import "./DeliveryApp.css";

function DeliveryApp() {
  const [screen, setScreen] = useState(1);
  const [distance, setDistance] = useState(null); // meters

  // 고정된 수령인 위치 (예: 카페 앞)
  const recipientLocation = {
    lat: 37.6020,
    lng: 127.0419,
  };

  useEffect(() => {
    if (screen === 3) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const d = getDistanceFromLatLonInMeters(
            userLat,
            userLng,
            recipientLocation.lat,
            recipientLocation.lng
          );
          setDistance(Math.round(d));
        });
      } else {
        setDistance("위치 정보 없음");
      }
    }
  }, [screen]);

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * 화면별 콘텐츠 렌더링
   */
  const renderContent = () => {
    switch (screen) {
      case 1:
        // 첫 번째 화면: 이름 제거, 카드 크기 축소 & 버튼 우측 배치
        return (
          <div className="content">
            <h2 className="delivery-title">오늘의 배달 목록</h2>
            <div className="card small-card">
              <div className="card-content small-card-content">
                <div>
                  <p>주문번호: #001</p>
                  <p>장소: 대학 정문</p>
                </div>
                <button className="action-button" onClick={() => setScreen(2)}>
                  배달 시작
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="map-content">
            <h2 className="delivery-title">배달 경로</h2>
            <div className="map-placeholder">지도 API 영역</div>
          </div>
        );
      case 3:
        return (
          <div className="content">
            <h2 className="delivery-title">수령인 거리 확인</h2>
            <p className="info-text">
              {distance !== null
                ? `남은 거리: ${distance}m`
                : "위치 정보를 가져오는 중..."}
            </p>
            <button className="action-button" onClick={() => setScreen(4)}>
              배달 완료
            </button>
          </div>
        );
      case 4:
        return (
          <div className="content">
            <h2 className="delivery-title">배달을 완료하셨나요?</h2>
            <div className="button-group">
              <button className="action-button" onClick={() => setScreen(5)}>
                Yes
              </button>
              <button
                className="action-button outline"
                onClick={() => setScreen(3)}
              >
                No
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="map-content">
            <h2 className="delivery-title">매장으로 돌아가는 길</h2>
            <div className="map-placeholder">복귀 지도 영역</div>
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * 하단 네비게이션 영역
   * (메뉴얼, 매장 연락 버튼은 항상 고정하고,
   *  화면 2/5일 때 중앙 버튼 표시)
   */
  const renderFooter = () => {
    let centerButton = null;
    if (screen === 2) {
      centerButton = (
        <button className="action-button" onClick={() => setScreen(3)}>
          도착
        </button>
      );
    } else if (screen === 5) {
      centerButton = (
        <button className="action-button" onClick={() => setScreen(1)}>
          홈으로
        </button>
      );
    }

    return (
      <div className="footer">
        <div className="footer-left">
          <button className="action-button">매뉴얼</button>
        </div>
        <div className="footer-center">{centerButton}</div>
        <div className="footer-right">
          <button className="action-button">매장 연락</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-frame">
      <div className="delivery-container">
        {renderContent()}
        {renderFooter()}
      </div>
    </div>
  );
}

export default DeliveryApp;
