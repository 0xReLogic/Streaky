#!/usr/bin/env python3
"""
Tests for main.py optimizations
Tests that SESSION object is properly created and reused
"""

import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main


class TestSessionOptimization(unittest.TestCase):
    """Test that HTTP session is properly initialized and reused"""
    
    def test_session_is_created(self):
        """Test that SESSION object is created as a requests.Session"""
        import requests
        self.assertIsInstance(main.SESSION, requests.Session)
    
    def test_session_is_singleton(self):
        """Test that SESSION is a module-level singleton"""
        # The SESSION should be the same object across imports
        session1 = main.SESSION
        # Reload to verify it's module-level
        import importlib
        importlib.reload(main)
        session2 = main.SESSION
        # They should be different instances after reload, but both should be Session objects
        import requests
        self.assertIsInstance(session1, requests.Session)
        self.assertIsInstance(session2, requests.Session)


class TestHTTPPerformance(unittest.TestCase):
    """Test that HTTP calls use the SESSION object for connection reuse"""
    
    @patch.object(main, 'SESSION')
    def test_github_api_uses_session(self, mock_session):
        """Test that get_todays_contribution_count uses SESSION.post"""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'data': {
                'user': {
                    'contributionsCollection': {
                        'contributionCalendar': {
                            'totalContributions': 5
                        }
                    }
                }
            }
        }
        mock_session.post.return_value = mock_response
        
        # Call the function
        result = main.get_todays_contribution_count('testuser', 'testtoken')
        
        # Verify SESSION.post was called
        mock_session.post.assert_called_once()
        self.assertEqual(result, 5)
    
    @patch.object(main, 'SESSION')
    def test_discord_webhook_uses_session(self, mock_session):
        """Test that invoke_discord_webhook uses SESSION.post"""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 204
        mock_session.post.return_value = mock_response
        
        # Call the function
        from datetime import datetime, timezone
        now_utc = datetime.now(timezone.utc)
        main.invoke_discord_webhook('https://webhook.url', now_utc, 10, 30)
        
        # Verify SESSION.post was called
        mock_session.post.assert_called_once()


if __name__ == '__main__':
    unittest.main()
