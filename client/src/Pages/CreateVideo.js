import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button } from "react-bootstrap";
import { baseURL } from "../Config/config";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "font-awesome/css/font-awesome.min.css";
import axios from "axios";
import ConfirmModal from "../Components/CreateVideo/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

function CreateVideo() {
  const [video, setVideo] = useState({ title: "", desc: "", createdBy: "", type: "PUBLIC" });
  const [validated, setValidated] = useState(false);
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [videoId, setVideoId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const navigate = useNavigate();

  const handleInputChanges = (event) => setVideo(prev => ({ ...prev, [event.target.name]: event.target.value }));
  const startListening = () => SpeechRecognition.startListening({ continuous: true });
  const stopListening = () => SpeechRecognition.stopListening();

  const validateVideo = () => {
    if (!video.title || !video.desc || !video.createdBy) return false;
    else if (mode === "text" && !text) return false;
    else if (mode === "file" && !file) return false;
    else if (mode === "speech" && !transcript) return false;
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateVideo() === false) { event.stopPropagation(); setValidated(true); return; }
    setValidated(true);
    let content = "";
    if (mode === "text") content = text;
    else if (mode === "file") content = await file.text();
    else if (mode === "speech") content = transcript;

    axios.post(`${baseURL}/videos/create-video`, { ...video, content })
      .then(res => { setVideoId(res.data.videoId); setShowModal(true); })
      .catch(err => console.log(err));
  };

  return (
    <div className="main-content" style={{ padding: '60px 20px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: '10%', width: '500px', height: '500px', background: 'var(--accent-blue)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--accent-glow)', color: 'var(--text-primary)', fontSize: '2rem' }}>
            <i className="fa-solid fa-video" />
          </div>
          <h2 className="heading-lg mb-3">
            <span className="text-gradient">Create a New Video!</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Fill out this form and provide your content to create a dynamic ASL video animation in just a few clicks.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card" style={{ padding: '40px' }}>
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="d-flex flex-column gap-4">

              <Form.Group controlId="title">
                <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}><i className="fa-solid fa-heading me-2 text-gradient" />Title of Video</Form.Label>
                <Form.Control required type="text" placeholder="Enter video title" value={video.title} name="title" onChange={handleInputChanges} className="form-control" />
                <Form.Control.Feedback type="invalid">Please enter a title.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="desc">
                <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}><i className="fa-solid fa-align-left me-2 text-gradient" />Description of Video</Form.Label>
                <Form.Control required as="textarea" rows={4} placeholder="What is this video about?" name="desc" onChange={handleInputChanges} className="form-control" style={{ resize: 'none' }} />
                <Form.Control.Feedback type="invalid">Please enter a description.</Form.Control.Feedback>
              </Form.Group>

              <div className="row g-4">
                <Form.Group as={Col} md="6" controlId="createdBy">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}><i className="fa-solid fa-user me-2 text-gradient" />Name of Creator</Form.Label>
                  <Form.Control required type="text" placeholder="Your name" name="createdBy" onChange={handleInputChanges} className="form-control" />
                  <Form.Control.Feedback type="invalid">Please enter your name.</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="6" controlId="type">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}><i className="fa-solid fa-lock me-2 text-gradient" />Visibility</Form.Label>
                  <Form.Select required value={video.type} name="type" onChange={handleInputChanges} className="form-control" style={{ cursor: 'pointer' }}>
                    <option value="PUBLIC">Public (Visible to community)</option>
                    <option value="PRIVATE">Private (Link sharing only)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '10px 0' }} />

              <Form.Group controlId="mode">
                <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}><i className="fa-solid fa-keyboard me-2 text-gradient" />Input Method</Form.Label>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-main)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  {[{ id: 'text', icon: 'fa-align-justify', label: 'Type Text' }, { id: 'speech', icon: 'fa-microphone', label: 'Speak' }, { id: 'file', icon: 'fa-file-lines', label: 'Upload .txt' }].map(m => (
                    <button type="button" key={m.id} onClick={() => setMode(m.id)} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === m.id ? 'var(--bg-surface)' : 'transparent',
                      color: mode === m.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', transition: 'all 0.3s'
                    }}>
                      <i className={`fa-solid ${m.icon} me-2`} /> {m.label}
                    </button>
                  ))}
                </div>
              </Form.Group>

              <AnimatePresence mode="popLayout">
                {mode === "text" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Form.Group controlId="text">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>Content</Form.Label>
                      <Form.Control required as="textarea" rows={6} placeholder="Type your content here..." name="content" onChange={e => setText(e.target.value)} className="form-control" style={{ resize: 'none' }} />
                      <Form.Control.Feedback type="invalid">Please type your content.</Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>
                )}

                {mode === "file" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Form.Group controlId="formFile">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>Upload Content</Form.Label>
                      <div style={{ padding: '40px', border: '2px dashed var(--border-light)', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-surface-hover)' }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)', marginBottom: '16px' }} />
                        <Form.Control type="file" accept=".txt" onChange={e => setFile(e.target.files[0])} required className="form-control" style={{ margin: '0 auto', maxWidth: '300px' }} />
                      </div>
                      <Form.Control.Feedback type="invalid">Please upload a text file.</Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>
                )}

                {mode === "speech" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Form.Group controlId="speech-text">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Form.Label style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                          🎤 Speech Input
                          <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: listening ? '#10b981' : 'var(--text-muted)' }}>
                            {listening ? '● LIVE LISTENING' : '○ OFF'}
                          </span>
                        </Form.Label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" className="btn-premium-outline" onClick={startListening} style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: listening ? '#10b981' : '' }}>
                            <i className="fa-solid fa-play me-1" /> Start
                          </button>
                          <button type="button" className="btn-premium-outline" onClick={stopListening} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <i className="fa-solid fa-stop me-1" /> Stop
                          </button>
                          <button type="button" className="btn-premium-outline" onClick={resetTranscript} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            Clear
                          </button>
                        </div>
                      </div>
                      <Form.Control required readOnly as="textarea" rows={6} placeholder="Your spoken content will appear here..." value={transcript} className="form-control" style={{ resize: 'none' }} />
                      <Form.Control.Feedback type="invalid">Please provide content via speech.</Form.Control.Feedback>
                    </Form.Group>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" className="btn-premium w-100" style={{ marginTop: '16px', padding: '14px' }}>
                <i className="fa-solid fa-wand-magic-sparkles me-2" /> Generate ASL Video
              </button>
            </Form>
          </div>
        </motion.div>
      </div>

      <ConfirmModal show={showModal} onHide={() => { setShowModal(false); navigate('/hearaid/all-videos', { replace: true }); }} videoId={videoId} />
    </div>
  );
}

export default CreateVideo;
