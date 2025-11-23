# Tusk

<div align="center">

<img src="docs/images/tusk-logo.png" alt="Tusk Logo" width="140"/>

**Blockchain-Powered Secure Recruitment Platform**

Tusk leverages Sui Network contracts and Walrus distributed storage to build a next-generation recruitment environment where no one can access resumes without job seeker approval.

</div>

## Problem Statement

The current recruitment market faces serious privacy and security issues. Most recruitment platforms allow recruiters to freely access job seekers' resumes and personal information without explicit consent. This not only violates job seekers' privacy but also results in indiscriminate exposure of personal information.

Additionally, the centralized server architecture is vulnerable to security threats such as hacking and internal data breaches. A single security incident can expose sensitive information of countless job seekers.

The biggest problem is that job seekers have no control over their own information. On existing platforms, once a profile is registered, information is exposed to all recruiters. However, many job seekers prefer to disclose detailed resumes only when seriously entering the recruitment process.

In the current system, job seekers cannot know who, when, or for what purpose their resumes were viewed, nor can they selectively disclose information. This opaque system creates psychological burden for job seekers, undermines trust between job seekers and recruiters, and hinders the formation of a healthy recruitment ecosystem.

---

## Solution

**Tusk** fundamentally solves these problems through a blockchain-based access control system.

Recruiters can no longer arbitrarily view job seekers' information and must request permission and receive approval to access resumes. This allows job seekers to clearly distinguish between the profile browsing stage and the actual recruitment process entry stage, enabling selective disclosure of detailed information only to companies with serious hiring intentions.

All resumes are encrypted at upload and stored on the Walrus distributed network, fundamentally blocking data breach risks from central server hacking or single points of failure.

Access permission management is automatically handled by Sui blockchain smart contracts, and all access requests and approval records are permanently stored on the blockchain. This enables complete transparency in tracking who accessed what information and when.

**Most importantly, job seekers gain complete control over their information**. They can selectively disclose information only to desired recruiters and conduct job searches with confidence, free from the burden of indiscriminate information exposure.

## Key Features

### Privacy-First Design

- **End-to-End Encryption**: All resumes and sensitive data are encrypted before upload and storage
- **Permission-Based Access Control**: No one can access data without explicit approval from job seekers
- **Decentralized Storage**: Safe file storage and redundancy through Walrus distributed network

### AI-Powered Smart Matching

- **Semantic Search**: Accurate matching of jobs and candidates using vector embeddings
- **Multi-Dimensional Filtering**: Search based on various criteria including tech stack, experience, and preferences
- **Privacy-Preserving**: Matching results provided without exposing personally identifiable information

### Blockchain-Based Transparency

- **Immutable Access Records**: All view requests and approval records permanently stored on blockchain
- **Automated Permission Management**: Sui smart contracts automatically handle access permissions
- **Transparent Access History**: Verify who accessed information and when via blockchain

---

## System Architecture

### Complete Flow

#### 1. Job Seeker Registration and Resume Upload

![Flow 1](docs/images/flow-1.png)

**Process:**

1. Create access policy through Sui Network contract
2. Encrypt uploaded resume using Seal SDK
3. Encryption keys distributed and stored across Seal Key Servers
4. Upload encrypted resume to Walrus Network
5. Label job skills and tech stack from resume using LLM
6. Convert labeled data into vector embeddings and store

**Core Technologies:**

- **Sui Access Policy Contract**: Blockchain-based access permission policy object creation
- **Walrus Network**: Secure data storage through decentralized file storage
- **Google Gemini AI**: Resume content analysis and automatic labeling
- **Vector Embedding**: High-dimensional vector transformation and storage for semantic search

---

#### 2. Recruiter Search

![Flow 2](docs/images/flow-2.png)

**Process:**

1. Recruiter requests search for candidates matching criteria
2. AI vector similarity query returns relevant profiles
3. Only basic information displayed, excluding sensitive data

**Core Technologies:**

- Vector embeddings using Google Gemini AI
- Similarity search via PostgreSQL + pgvector
- Privacy protection through server-side filtering

---

#### 3. Access Permission Request

![Flow 3](docs/images/flow-3.png)

**Process:**

1. Recruiter requests access to specific job seeker's detailed information
2. Create View Request Object on Sui Network
3. Request information stored in database
4. Notification sent to job seeker

---

#### 4. Job Seeker Approval/Rejection

![Flow 4](docs/images/flow-4.png)

**Process:**

1. Job seeker reviews access request
2. Decides to approve or reject
3. Execute policy contract's `Approve` or `Reject` function
4. Approval status recorded on blockchain

---

#### 5. Approved Recruiter Resume Access

![Flow 5](docs/images/flow-5.png)

**Process:**

1. Retrieve encrypted data from Walrus
2. Create and sign permission verification transaction with Session Key and Seal Access Policy Contract
3. Request decryption key from Seal Server
4. Decrypt encrypted data with decryption key
5. Download decrypted data

**Core Technologies:**

- Key management through Seal Key Server
- Decryption after permission verification

---
