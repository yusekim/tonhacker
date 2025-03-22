/* global naver */
import React, { useEffect, useState, useRef } from "react";
import "./DeliveryApp.css";

function DeliveryApp() {
	const [screen, setScreen] = useState(1);
	const [distance, setDistance] = useState(null);
	const [showManual, setShowManual] = useState(false);
	const mapRef = useRef(null);
	const mapInstance = useRef(null);
	const polylineRef = useRef(null);

	const resetToHome = () => {
		setDistance(null);
		setScreen(1);
	};

	// 서울시립대 정보기술관 (예시 하드코딩 좌표)
	const recipientLocation = {
		lat: 37.583191,
		lng: 127.060380,
	};

	const freewhaleLocation = {
		lat: 37.583718,
		lng: 127.060194,
	};

	// 버튼 클릭 시 매뉴얼 창을 닫은 후 원하는 액션을 수행하는 헬퍼 함수
	const handleButtonClick = (action) => () => {
		if (showManual) {
			setShowManual(false);
		}
		action();
	};

	// 해시를 이용하여 화면 전환을 처리하는 로직
	useEffect(() => {
		if (window.location.hash) {
			const hashScreen = parseInt(window.location.hash.replace("#", ""), 10);
			if (!isNaN(hashScreen)) {
				setScreen(hashScreen);
			}
		}

		const handleHashChange = () => {
			const newScreen = parseInt(window.location.hash.replace("#", ""), 10);
			if (!isNaN(newScreen)) {
				setScreen(newScreen);
			}
		};
		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	// screen 상태가 변경될 때마다 URL 해시를 업데이트 (pushState 사용)
	useEffect(() => {
		const currentHash = window.location.hash.replace("#", "");
		if (currentHash !== screen.toString()) {
			window.history.pushState(null, "", `#${screen}`);
		}
	}, [screen]);

	useEffect(() => {
		// 기존 지도 인스턴스 정리
		if (mapInstance.current) {
			mapInstance.current.destroy();
			mapInstance.current = null;
		}

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

		if (screen === 2 && navigator.geolocation) {
			const watchId = navigator.geolocation.watchPosition((position) => {
				const userLat = position.coords.latitude;
				const userLng = position.coords.longitude;
				const mapCenter = new naver.maps.LatLng(userLat, userLng);
				if (!mapInstance.current) {
					if (mapRef.current) {
						mapInstance.current = new naver.maps.Map(mapRef.current, {
							center: mapCenter,
							zoom: 15,
						});
					}

					new naver.maps.Marker({
						position: mapCenter,
						map: mapInstance.current,
					});
				} else {
					mapInstance.current.setCenter(mapCenter);
				}

				fetch(
					`http://localhost:4000/api/directions?startLng=${userLng}&startLat=${userLat}&goalLng=${recipientLocation.lng}&goalLat=${recipientLocation.lat}`
				)
					.then((res) => res.json())
					.then((data) => {
						console.log(data);
						const route = data.route.traoptimal[0].path.map(
							(point) => new naver.maps.LatLng(point[1], point[0])
						);
						if (polylineRef.current) {
							polylineRef.current.setMap(null); // 기존 선 지우기
						}

						polylineRef.current = new naver.maps.Polyline({
							map: mapInstance.current,
							path: route,
							strokeColor: "#5347AA",
							strokeWeight: 5,
						});
					})
					.catch((err) => console.error(err));

				return () => {
					navigator.geolocation.clearWatch(watchId);
					console.log("watchPosition 중지됨");

					if (mapInstance.current) {
						mapInstance.current.destroy();
						mapInstance.current = null;
					}
				};
			});

		}

		// screen 4: 복귀 경로 표시 (반대 방향)
		if (screen === 4 && navigator.geolocation) {
			const watchId = navigator.geolocation.watchPosition((position) => {
				const userLat = position.coords.latitude;
				const userLng = position.coords.longitude;
				const mapCenter = new naver.maps.LatLng(userLat, userLng);
				if (!mapInstance.current) {
					if (mapRef.current) {
						mapInstance.current = new naver.maps.Map(mapRef.current, {
							center: mapCenter,
							zoom: 15,
						});
					}

					new naver.maps.Marker({
						position: mapCenter,
						map: mapInstance.current,
					});
				} else {
					mapInstance.current.setCenter(mapCenter);
				}

				fetch(
					`http://localhost:4000/api/directions?startLng=${freewhaleLocation.lng}&startLat=${freewhaleLocation.lat}&goalLng=${userLng}&goalLat=${userLat}`
				)
					.then((res) => res.json())
					.then((data) => {
						const route = data.route.traoptimal[0].path.map(
							(point) => new naver.maps.LatLng(point[1], point[0])
						);
						if (polylineRef.current) {
							polylineRef.current.setMap(null); // 기존 선 지우기
						}

						polylineRef.current = new naver.maps.Polyline({
							map: mapInstance.current,
							path: route,
							strokeColor: "#5347AA",
							strokeWeight: 5,
						});
					})
					.catch((err) => console.error(err));

				return () => {
					navigator.geolocation.clearWatch(watchId);
					console.log("watchPosition 중지됨");

					if (mapInstance.current) {
						mapInstance.current.destroy();
						mapInstance.current = null;
					}
				};
			});
		}

		if (screen === 5 && mapRef.current) {
			const mapCenter = new naver.maps.LatLng(37.602, 127.0419);
			mapInstance.current = new naver.maps.Map(mapRef.current, {
				center: mapCenter,
				zoom: 17,
			});
			new naver.maps.Marker({
				position: mapCenter,
				map: mapInstance.current,
			});
		}
	}, [screen]);

	function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
		const R = 6371000;
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	function deg2rad(deg) {
		return deg * (Math.PI / 180);
	}

	// 매뉴얼 창의 표시 여부를 토글하는 함수
	const toggleManual = () => {
		setShowManual((prev) => !prev);
	};

	// 메뉴얼 창 컴포넌트 (조건부 렌더링)
	const renderManual = () => {
		if (!showManual) return null;
		return (
			<div className="manual-modal">
			<div className="manual-content">
			<h2>느린학습자 배달원 행동 수칙</h2>
			<ul>
			<li>주문자에게 정중하게 인사합니다.</li>
			<li>주문 내역을 확인하고 정확한 위치를 점검합니다.</li>
			<li>배달 시 안전에 유의하며, 주변을 살핍니다.</li>
			<li>문제 발생 시 매장 연락 버튼을 눌러 지원을 요청합니다.</li>
			</ul>
			<button className="action-button" onClick={toggleManual}>
			닫기
			</button>
			</div>
			</div>
		);
	};

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
					<button
					className="action-button"
					onClick={handleButtonClick(() => setScreen(2))}
					>
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
					<div
					key={`map-${screen}`}
					ref={mapRef}
					style={{ width: "100%", height: "400px" }}
					/>
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
					<button
					className="action-button"
					onClick={handleButtonClick(() => setScreen(4))}
					>
					배달 완료
					</button>
					</div>
				);
			case 4:
				return (
					<div className="map-content">
					<h2 className="delivery-title">복귀 경로</h2>
					<div
					key={`map-${screen}`}
					ref={mapRef}
					style={{ width: "100%", height: "400px" }}
					/>
					</div>
				);
			default:
				return null;
		}
	};

	const renderFooter = () => {
		let centerButton = null;
		if (screen === 2) {
			centerButton = (
				<button
				className="action-button"
				onClick={handleButtonClick(() => setScreen(3))}
				>
				도착
				</button>
			);
		} else if (screen === 4) {
			centerButton = (
				<button
				className="action-button"
				onClick={handleButtonClick(() => setScreen(1))}
				>
				도착
				</button>
			);
		}

		return (
			<div className="footer">
			<div className="footer-left">
			<button className="action-button" onClick={toggleManual}>
			매뉴얼
			</button>
			</div>
			<div className="footer-center">{centerButton}</div>
			<div className="footer-right">
			<button className="action-button" onClick={handleButtonClick(() => {})}>
			매장 연락
			</button>
			</div>
			</div>
		);
	};

	return (
		<div className="app-frame">
		<div className="delivery-container">
		{renderContent()}
		{renderFooter()}
		{renderManual()}
		</div>
		</div>
	);
}

export default DeliveryApp;
