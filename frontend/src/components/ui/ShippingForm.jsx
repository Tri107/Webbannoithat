import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ShippingForm({ formData, setFormData }) {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    // Fetch cities initially
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(res => setCities(res.data))
      .catch(err => console.error("Error fetching cities", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, options, selectedIndex } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "city") {
      // Find the selected city to trigger district fetch
      const selectedCityId = options[selectedIndex].getAttribute('data-id');
      if (selectedCityId) {
        axios.get(`https://provinces.open-api.vn/api/p/${selectedCityId}?depth=2`)
          .then(res => {
            setDistricts(res.data.districts || []);
            setWards([]); 
            setFormData(prev => ({ ...prev, district: "", ward: "" }));
          })
          .catch(err => console.error(err));
      }
    } else if (name === "district") {
      // Find the selected district to trigger ward fetch
      const selectedDistrictId = options[selectedIndex].getAttribute('data-id');
      if (selectedDistrictId) {
        axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrictId}?depth=2`)
          .then(res => {
            setWards(res.data.wards || []);
            setFormData(prev => ({ ...prev, ward: "" }));
          })
          .catch(err => console.error(err));
      }
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-5">Thông tin giao hàng</h2>
      <div className="space-y-4">
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Nhập họ và tên"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Nhập email"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
        />
       
        
        <div className="grid grid-cols-3 gap-3">
          <div className="relative">
            <select
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors appearance-none bg-white text-slate-700"
            >
              <option value="" disabled hidden>Chọn Tỉnh/Thành</option>
              {cities.map((city) => (
                <option key={city.code} value={city.name} data-id={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
            <select
              name="district"
              value={formData.district || ""}
              onChange={handleChange}
              disabled={!formData.city}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors appearance-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="" disabled hidden>Chọn Quận/Huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.name} data-id={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
            <select
              name="ward"
              value={formData.ward || ""}
              onChange={handleChange}
              disabled={!formData.district}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors appearance-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="" disabled hidden>Chọn Phường/Xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.name} data-id={ward.code}>
                  {ward.name}
                </option>
                
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Địa chỉ, tên đường"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
        />
        <input
          type="text"
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Ghi chú đơn hàng"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
        />
      </div>
    </div>
  );
}
