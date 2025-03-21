/* global naver */
import React, { useEffect, useState, useRef } from "react";
import "./DeliveryApp.css";

function DeliveryApp() {
  const [screen, setScreen] = useState(1);
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const resetToHome = () => {
    setDistance(null);
    setScreen(1);
  };


// 일단 하드코딩
// 서울시립대 정보기술관
  const recipientLocation = {
    lat: 37.583191,
  	lng: 127.060380,
  };

  useEffect(() => {
    if (screen === 3 && navigator.geolocation) {
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
    }

    if (screen === 2 && navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const mapCenter = new naver.maps.LatLng(userLat, userLng);
        mapInstance.current = new naver.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 15,
        });

        new naver.maps.Marker({
          position: mapCenter,
          map: mapInstance.current,
        });

	  fetch(`http://localhost:4000/api/directions?startLng=${userLng}&startLat=${userLat}&goalLng=${recipientLocation.lng}&goalLat=${recipientLocation.lat}`)
		  .then(res => res.json())
		  .then(data => {
			console.log('API 응답:', data.route);
			const route = data.route.traoptimal[0].path.map(
			  point => new naver.maps.LatLng(point[1], point[0])
			);
			new naver.maps.Polyline({
			  map: mapInstance.current,
			  path: route,
			  strokeColor: "#5347AA",
			  strokeWeight: 5,
			});
		  })
		  .catch(err => console.error(err));


      });
    }

    if (screen === 5 && mapRef.current) {
      const mapCenter = new naver.maps.LatLng(37.6020, 127.0419);

      mapInstance.current = new naver.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 17,
      });

      new naver.maps.Marker({
        position: mapCenter,
        map: mapInstance.current,
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [screen]);

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const renderContent = () => {
    switch (screen) {
      case 1:
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
            <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
          </div>
        );
      case 3:
        return (
          <div className="content">
            <h2 className="delivery-title">수령인 거리 확인</h2>
            <p className="info-text">
              {distance !== null ? `남은 거리: ${distance}m` : "위치 정보를 가져오는 중..."}
            </p>
            <button className="action-button" onClick={resetToHome}>
              배달 완료
            </button>
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
        <button className="action-button" onClick={resetToHome}>
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
