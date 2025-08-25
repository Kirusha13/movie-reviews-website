import React, { useState } from 'react';
import './DocumentForm.css';

function DocumentForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    registryNumber: '',
    issueDate: '',
    validityPeriod: '',
    photo: null,
    subject: '',
    municipality: '',
    protectedArea: '',
    foreignLanguage: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create form data for sending
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    
    try {
      const response = await fetch('http://localhost:5000/generate-document', {
        method: 'POST',
        body: data,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error generating document');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate document');
    }
  };

  return (
    <div className="document-form">
      <h2>Форма для генерации документа экскурсовода</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ФИО:</label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Регистрационный номер в федеральном реестре:</label>
          <input 
            type="text" 
            name="registryNumber" 
            value={formData.registryNumber}
            onChange={handleChange}
            placeholder="00-А-000000-00"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Дата выдачи:</label>
          <input 
            type="date" 
            name="issueDate" 
            value={formData.issueDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Срок действия:</label>
          <input 
            type="date" 
            name="validityPeriod" 
            value={formData.validityPeriod}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Фотография:</label>
          <input 
            type="file" 
            name="photo" 
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Субъект РФ:</label>
          <input 
            type="text" 
            name="subject" 
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Муниципальное образование:</label>
          <input 
            type="text" 
            name="municipality" 
            value={formData.municipality}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Особо Охраняемая природная территория:</label>
          <input 
            type="text" 
            name="protectedArea" 
            value={formData.protectedArea}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Иностранный язык:</label>
          <input 
            type="text" 
            name="foreignLanguage" 
            value={formData.foreignLanguage}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Сгенерировать документ</button>
      </form>
    </div>
  );
}

export default DocumentForm; 