package com.oceanview.repositories;

import com.oceanview.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // 🔑 REQUIRED for login & register checks
    User findByUsername(String username);

    // (Optional but useful later)
    User findByEmail(String email);
}